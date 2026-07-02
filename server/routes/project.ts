import express from 'express';
import type { Request, Response } from 'express';
import { verifyToken, getUserIdFromtoken } from '../commonFunctions.js';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { generateAndSendPDF } from '../genrateDocument.js';
import { toLegacyProject, readingsToLegacyPvDetails } from '../mappers.js';
import type { ProjectRow, ProductRow, ProfileRow, PvReadingRow } from '../types.js';

const router = express.Router();

const UNIQUE_VIOLATION = '23505';

/** Fallback Wp/m² (mono) for products saved before kwp existed. */
const FALLBACK_WP_PER_M2 = 205;

/**
 * Rolls a project's sites up to the most specific place they all share:
 * one city → "City · Country", one state → "State · Country", one country →
 * "Country", several → "N countries". Null when no site has geo data yet
 * (sites saved before the product_geo migration backfill on their next edit).
 */
function rollupLocation(products: ProductRow[]): string | null {
  const located = products.filter((product) => product.country);
  if (located.length === 0) return null;

  const unique = (values: (string | null | undefined)[]) =>
    Array.from(new Set(values.filter(Boolean) as string[]));

  const countries = unique(located.map((product) => product.country));
  if (countries.length > 1) return `${countries.length} countries`;

  const [country] = countries;
  const cities = unique(located.map((product) => product.city));
  if (cities.length === 1 && located.every((product) => product.city)) return `${cities[0]} · ${country}`;

  const states = unique(located.map((product) => product.state));
  if (states.length === 1 && located.every((product) => product.state)) return `${states[0]} · ${country}`;

  return country;
}

// Get All Projects API — each project carries card aggregates (site count,
// total installed kWp) for the Projects page.
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUserIdFromtoken(req);
    const projectId = req.query.projectId as string | undefined;

    if (projectId) {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', user)
        .eq('id', projectId)
        .maybeSingle();
      if (error) throw error;
      res.json(data ? toLegacyProject(data as ProjectRow) : null);
      return;
    }

    const [projectsResult, productsResult] = await Promise.all([
      supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', user)
        .order('created_at', { ascending: true }),
      supabaseAdmin.from('products').select('*').eq('user_id', user),
    ]);
    if (projectsResult.error) throw projectsResult.error;
    if (productsResult.error) throw productsResult.error;

    const stats = new Map<string, { sites: number; capacity: number; products: ProductRow[] }>();
    (productsResult.data as ProductRow[]).forEach((product) => {
      const entry = stats.get(product.project_id) ?? { sites: 0, capacity: 0, products: [] };
      entry.sites += 1;
      entry.capacity += product.kwp ?? (product.area * FALLBACK_WP_PER_M2) / 1000;
      entry.products.push(product);
      stats.set(product.project_id, entry);
    });

    res.json(
      (projectsResult.data as ProjectRow[]).map((row) => ({
        ...toLegacyProject(row),
        sites: stats.get(row.id)?.sites ?? 0,
        capacity: Math.round((stats.get(row.id)?.capacity ?? 0) * 10) / 10,
        // Location rolled up from the project's sites.
        autoLocation: rollupLocation(stats.get(row.id)?.products ?? []),
      }))
    );
  } catch (error) {
    console.error('Error in get all projects API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/create', verifyToken, async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    const user = getUserIdFromtoken(req);

    const { error } = await supabaseAdmin.from('projects').insert({ name, user_id: user });

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        res.status(400).json({ error: 'Project name already exists!' });
        return;
      }
      throw error;
    }

    res.json({ message: 'Project created successfully' });
  } catch (error) {
    console.error('Error in create project API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Project API — accepts any subset of { name, active }.
router.put('/update/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body as {
      name?: string;
      active?: boolean;
    };
    const user = getUserIdFromtoken(req);

    const patch = {
      ...(name !== undefined ? { name } : {}),
      ...(active !== undefined ? { active } : {}),
    };
    if (!Object.keys(patch).length) {
      res.status(400).json({ error: 'Nothing to update' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user)
      .select();

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        res.status(400).json({ error: 'Project name already exists!' });
        return;
      }
      throw error;
    }
    if (!data?.length) {
      res.status(400).json({ error: 'Unauthorized' });
      return;
    }

    res.json({
      message: 'Project updated successfully',
      result: { name },
    });
  } catch (error) {
    console.error('Error in update project API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Project API — products and pv_readings cascade via foreign keys.
router.delete('/delete/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = getUserIdFromtoken(req);

    const { data, error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user)
      .select();
    if (error) throw error;
    if (!data?.length) {
      res.status(400).json({ error: 'Unauthorized' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in delete project API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get PV data API — returns readings in the legacy hourWiseData shape.
router.get('/getPVData', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUserIdFromtoken(req);
    const project = req.query.projectId as string | undefined;
    const product = req.query.productId as string | undefined;
    if ((!project && !product) || (project && product)) {
      res.json({ message: 'Provide any one product or project id' });
      return;
    }

    let query = supabaseAdmin
      .from('pv_readings')
      .select('*')
      .eq('user_id', user)
      .order('recorded_at', { ascending: true });
    query = project ? query.eq('project_id', project) : query.eq('product_id', product);

    const { data, error } = await query;
    if (error) throw error;

    const details = readingsToLegacyPvDetails(data as PvReadingRow[]);
    if (project) {
      res.json(details);
      return;
    }
    res.json(details[0] ?? null);
  } catch (error) {
    console.error('Error in get pv details API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate project report API
router.get('/generateApi/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUserIdFromtoken(req);
    const project = req.params.id;

    const { data: projectDetails, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', project)
      .eq('user_id', user)
      .maybeSingle();
    if (projectError) throw projectError;
    if ((projectDetails as ProjectRow | null)?.report_generated) {
      res.status(400).json({ message: 'Report already generated' });
      return;
    }

    const { data: readings, error: readingsError } = await supabaseAdmin
      .from('pv_readings')
      .select('*')
      .eq('project_id', project)
      .eq('user_id', user)
      .order('recorded_at', { ascending: true });
    if (readingsError) throw readingsError;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user)
      .maybeSingle();
    if (profileError) throw profileError;

    if (profile) {
      const pvDetails = readingsToLegacyPvDetails(readings as PvReadingRow[]);
      generateAndSendPDF(pvDetails, (profile as ProfileRow).email, projectDetails as ProjectRow | null)
        .then(async () => {
          console.log('PDF sent successfully!');
          const { error } = await supabaseAdmin
            .from('projects')
            .update({ report_generated: true })
            .eq('id', project);
          if (!error) {
            res.json({ message: `Report sent to email` });
          }
        })
        .catch((error) => {
          console.error('Error sending PDF:', error);
        });
    }
  } catch (error) {
    console.error('Error in get pv details API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate product report API
router.get('/generateApi/product/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = getUserIdFromtoken(req);
    const product = req.params.id;

    const { data: productDetails, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product)
      .eq('user_id', user)
      .maybeSingle();
    if (productError) throw productError;
    if ((productDetails as ProductRow | null)?.report_generated) {
      res.status(400).json({ message: 'Report already generated' });
      return;
    }

    const { data: readings, error: readingsError } = await supabaseAdmin
      .from('pv_readings')
      .select('*')
      .eq('product_id', product)
      .eq('user_id', user)
      .order('recorded_at', { ascending: true });
    if (readingsError) throw readingsError;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user)
      .maybeSingle();
    if (profileError) throw profileError;

    if (profile) {
      const pvDetails = readingsToLegacyPvDetails(readings as PvReadingRow[]);
      generateAndSendPDF(pvDetails, (profile as ProfileRow).email, productDetails as ProductRow | null)
        .then(async () => {
          console.log('PDF sent successfully!');
          const { error } = await supabaseAdmin
            .from('products')
            .update({ report_generated: true })
            .eq('id', product);
          if (!error) {
            res.json({ message: `Report sent to email` });
          }
        })
        .catch((error) => {
          console.error('Error sending PDF:', error);
        });
    }
  } catch (error) {
    console.error('Error in get pv details API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
