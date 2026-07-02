import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import {
  verifyToken,
  getUserIdFromtoken,
  getRandomNumber,
  calculateElectricityProduced,
  weathertoken,
  convertToDoubleDigit,
} from '../commonFunctions.js';
import type { WeatherHistoryResponse } from '../commonFunctions.js';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { toLegacyProduct } from '../mappers.js';
import type { PanelOrientation, ProductRow } from '../types.js';

const router = express.Router();

const UNIQUE_VIOLATION = '23505';

/** Module Wp/m² used to derive installed capacity (kWp) from area. */
const WP_PER_M2 = { mono: 205, poly: 175, thin: 120 } as const;

interface CreateProductBody {
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  longitude: number;
  latitude: number;
  project: string;
  // SolarSense fields (optional; require the solarsense_fields migration).
  module?: 'mono' | 'poly' | 'thin';
  mounting?: 'roof' | 'ground' | 'track';
  losses?: number;
  tariff?: number;
}

/** Columns for the optional SolarSense fields, only when the client sent them. */
function solarSenseColumns(body: CreateProductBody) {
  return {
    ...(body.module ? { module_type: body.module, kwp: (body.area * WP_PER_M2[body.module]) / 1000 } : {}),
    ...(body.mounting ? { mounting: body.mounting } : {}),
    ...(body.losses !== undefined ? { losses_pct: body.losses } : {}),
    ...(body.tariff !== undefined ? { tariff: body.tariff } : {}),
  };
}

// Define the route for creating a new product
router.post('/create', verifyToken, async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateProductBody;
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

    // Cheap duplicate check before spending a weather API call; the
    // unique(project_id, name) constraint is the real guarantee.
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

    const currentdate = new Date();
    const fromDate = `${currentdate.getFullYear()}-${convertToDoubleDigit(
      currentdate.getMonth() + 1
    )}-${convertToDoubleDigit(currentdate.getDate())}`;
    const endDate = `${currentdate.getFullYear()}-${convertToDoubleDigit(
      currentdate.getMonth() + 1
    )}-${convertToDoubleDigit(currentdate.getDate() + 1)}`;
    const dateWithHours = `${fromDate}:${convertToDoubleDigit(
      currentdate.getHours()
    )}`;
    const weatherResponse = await axios.get<WeatherHistoryResponse>(
      'https://api.weatherbit.io/v2.0/history/hourly',
      {
        params: {
          lat: latitude,
          lon: longitude,
          start_date: fromDate,
          end_date: endDate,
          key: weathertoken,
        },
      }
    );
    if (!weatherResponse.data.data || !weatherResponse.data.data.length) {
      console.error('Issue with weather API', weatherResponse?.data?.data);
      res.status(502).json({ error: 'Issue with weather API' });
      return;
    }

    const filteredData = weatherResponse.data.data.filter(
      (weather) => weather?.datetime === dateWithHours
    );
    let pvValue;
    let powerPeak;
    if (filteredData?.length) {
      const opitionalSolarVal = getRandomNumber();
      pvValue = await calculateElectricityProduced(
        { area },
        filteredData[0],
        opitionalSolarVal
      );
      const unixTimestamp = filteredData[0]?.ts;
      const dateTs = new Date((unixTimestamp ?? NaN) * 1000);
      // Hours part from the timestamp
      const hoursTs = dateTs.getHours();
      powerPeak = (pvValue * 1000) / hoursTs;
    }

    const { error: insertError } = await supabaseAdmin.from('products').insert({
      project_id: project,
      user_id: user,
      name,
      orientation,
      inclination,
      area,
      latitude,
      longitude,
      pv_value: pvValue ?? null,
      power_peak: powerPeak ?? null,
      ...solarSenseColumns(body),
    });
    if (insertError) {
      if (insertError.code === UNIQUE_VIOLATION) {
        res.status(400).json({ error: 'Product name already exists!' });
        return;
      }
      throw insertError;
    }

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

// Update Product API
router.put('/update/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as Omit<CreateProductBody, 'project'>;
    const { name, orientation, inclination, area, longitude, latitude } = body;
    const user = getUserIdFromtoken(req);

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        orientation,
        inclination,
        area,
        longitude,
        latitude,
        ...solarSenseColumns(body as CreateProductBody),
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

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in delete Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
