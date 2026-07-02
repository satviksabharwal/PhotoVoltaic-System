import express from 'express';
import type { Request, Response } from 'express';
import { verifyToken, getUserIdFromtoken } from '../commonFunctions.js';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { toLegacyProduct } from '../mappers.js';
import { capacityKwp, fetchCurrentGti, fetchPvgisAnnualKwh, hourlyEnergyKwh } from '../solar.js';
import type { PanelConfig } from '../solar.js';
import type { PanelOrientation, ProductRow } from '../types.js';

const router = express.Router();

const UNIQUE_VIOLATION = '23505';

interface ProductBody {
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  longitude: number;
  latitude: number;
  project: string;
  module?: 'mono' | 'poly' | 'thin';
  mounting?: 'roof' | 'ground' | 'track';
  losses?: number;
  tariff?: number;
}

function toPanelConfig(body: ProductBody): PanelConfig {
  return {
    latitude: body.latitude,
    longitude: body.longitude,
    orientation: body.orientation,
    inclination: body.inclination,
    area: body.area,
    module: body.module ?? 'mono',
    mounting: body.mounting ?? 'roof',
    losses: body.losses ?? 14,
  };
}

/**
 * Bumps the parent project's updated_at so "Updated X ago" on the Projects
 * page reflects site changes. Best-effort: failures are ignored.
 */
async function touchProject(projectId: string) {
  await supabaseAdmin
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', projectId);
}

/**
 * Stores the PVGIS annual estimate on a product. Best-effort: ignored when
 * PVGIS was unreachable or the est_annual_kwh migration has not run yet.
 */
async function storeAnnualEstimate(productId: string, estAnnualKwh: number | null) {
  if (estAnnualKwh == null) return;
  await supabaseAdmin.from('products').update({ est_annual_kwh: estAnnualKwh }).eq('id', productId);
}

// Define the route for creating a new product
router.post('/create', verifyToken, async (req: Request, res: Response) => {
  try {
    const body = req.body as ProductBody;
    const { name, orientation, inclination, area, longitude, latitude, project } = body;
    const user = getUserIdFromtoken(req);

    // Verify the target project exists and belongs to this user.
    const { data: validProject, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', project)
      .eq('user_id', user)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!validProject) {
      res.status(400).json({ error: 'Project not found' });
      return;
    }

    const { data: existingProduct, error: existingError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('project_id', project)
      .eq('name', name)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existingProduct) {
      res.status(400).json({ error: 'Product name already exists!' });
      return;
    }

    // Current-hour irradiance + authoritative annual estimate, in parallel.
    // Both are best-effort: a flaky data source never blocks saving the site.
    const panel = toPanelConfig(body);
    const [gti, estAnnualKwh] = await Promise.all([fetchCurrentGti(panel), fetchPvgisAnnualKwh(panel)]);
    const pvValue = gti != null ? hourlyEnergyKwh(panel, gti) : null;

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        project_id: project,
        user_id: user,
        name,
        orientation,
        inclination,
        area,
        latitude,
        longitude,
        pv_value: pvValue,
        // Average power over the current hour, in watts.
        power_peak: pvValue != null ? pvValue * 1000 : null,
        module_type: panel.module,
        mounting: panel.mounting,
        losses_pct: panel.losses,
        tariff: body.tariff ?? null,
        kwp: capacityKwp(panel.area, panel.module),
      })
      .select()
      .single();
    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION) {
        res.status(400).json({ error: 'Product name already exists!' });
        return;
      }
      throw insertError;
    }

    await storeAnnualEstimate((inserted as ProductRow).id, estAnnualKwh);
    await touchProject(project);
    res.json({ message: 'Product created successfully' });
  } catch (error) {
    console.error('Error in POST product API:', error);
    res.status(500).json({ error: 'Failed to create the product' });
  }
});

// Get All Products API
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUserIdFromtoken(req);
    const project = req.query.projectId as string | undefined;

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('user_id', user)
      .order('created_at', { ascending: true });
    if (project) {
      query = query.eq('project_id', project);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json((data as ProductRow[]).map(toLegacyProduct));
  } catch (error) {
    console.error('Error in get all products API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Individual Product API
router.get('/item', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUserIdFromtoken(req);
    const product = req.query.productId as string | undefined;

    if (!product) {
      res.json(null);
      return;
    }
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('user_id', user)
      .eq('id', product)
      .maybeSingle();
    if (error) throw error;
    res.json(data ? toLegacyProduct(data as ProductRow) : null);
  } catch (error) {
    console.error('Error in getting a Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Product API — recomputes capacity and refreshes the PVGIS estimate,
// since the panel geometry may have changed.
router.put('/update/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as Omit<ProductBody, 'project'>;
    const { name, orientation, inclination, area, longitude, latitude } = body;
    const user = getUserIdFromtoken(req);

    const panel = toPanelConfig(body as ProductBody);

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        orientation,
        inclination,
        area,
        longitude,
        latitude,
        module_type: panel.module,
        mounting: panel.mounting,
        losses_pct: panel.losses,
        tariff: body.tariff ?? null,
        kwp: capacityKwp(panel.area, panel.module),
      })
      .eq('id', id)
      .eq('user_id', user)
      .select();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        res.status(400).json({ error: 'Product name already exists!' });
        return;
      }
      throw error;
    }
    if (!data?.length) {
      res.status(400).json({ error: 'Unauthorized' });
      return;
    }

    const estAnnualKwh = await fetchPvgisAnnualKwh(panel);
    await storeAnnualEstimate(id, estAnnualKwh);
    await touchProject((data[0] as ProductRow).project_id);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error in update Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Product API — pv_readings cascade via foreign keys.
router.delete('/delete/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserIdFromtoken(req);

    const { data, error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user)
      .select();
    if (error) throw error;
    if (!data?.length) {
      res.status(400).json({ error: 'Unauthorized' });
      return;
    }

    await touchProject((data[0] as ProductRow).project_id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in delete Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
