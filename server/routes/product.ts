import express from 'express';
import type { Request, Response } from 'express';
import {
  verifyToken,
  getUserIdFromtoken,
  getRandomNumber,
  calculateElectricityProduced,
  weathertoken,
  convertToDoubleDigit,
} from '../commonFunctions.js';
import type { WeatherHistoryResponse } from '../commonFunctions.js';
import { Product, Project } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import type { PanelOrientation } from '../models/product.js';

const router = express.Router();

interface CreateProductBody {
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  longitude: number;
  latitude: number;
  project: string;
}

// Define the route for creating a new product
router.post('/create', verifyToken, async (req: Request, res: Response) => {
  try {
    // Extract the product data from the request body
    const {
      name,
      orientation,
      inclination,
      area,
      longitude,
      latitude,
      project,
    } = req.body as CreateProductBody;

    const user = getUserIdFromtoken(req);
    const existingProduct = await Product.findOne({ name, user, project });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product name already exists!' });
    }

    const validProject = await Project.findOne({ id: project });
    if (!validProject) {
      return res.status(400).json({ error: 'Project not found' });
    }

    // Generate a unique ID using UUID
    const id = uuidv4();
    const rawProduct = {
      id,
      name,
      orientation,
      inclination,
      area,
      longitude,
      latitude,
      user,
      project,
    };
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
          lat: rawProduct.latitude,
          lon: rawProduct.longitude,
          start_date: fromDate,
          end_date: endDate,
          key: weathertoken,
        },
      }
    );
    if (!weatherResponse.data.data || !weatherResponse.data.data.length) {
      console.error('Issue with weather API', weatherResponse?.data?.data);
      return res.status(502).json({ error: 'Issue with weather API' });
    }

    const filteredData = weatherResponse.data.data.filter(
      (weather) => weather?.datetime === dateWithHours
    );
    let pvValue;
    let powerPeak;
    if (filteredData?.length) {
      const opitionalSolarVal = getRandomNumber();
      pvValue = await calculateElectricityProduced(
        rawProduct,
        filteredData[0],
        opitionalSolarVal
      );
      const unixTimestamp = filteredData[0]?.ts;
      const dateTs = new Date((unixTimestamp ?? NaN) * 1000);
      // Hours part from the timestamp
      const hoursTs = dateTs.getHours();
      powerPeak = (pvValue * 1000) / hoursTs;
    }
    // Create a new product instance
    const product = new Product({ ...rawProduct, pvValue, powerPeak });

    // Save the product to the database
    await product.save();

    res.json({ message: 'Product created successfully' });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error in POST product API:', error);
    res.status(500).json({ error: 'Failed to create the product' });
  }
});

// Get All Products API
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Retrieve all Products from the database
    const user = getUserIdFromtoken(req);
    const project = req.query.projectId as string | undefined;
    const options: Record<string, unknown> = { user };
    if (project) {
      options['project'] = project;
    }
    const products = await Product.find(options);
    res.json(products);
  } catch (error) {
    console.error('Error in get all products API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Individual Product API
router.get('/item', verifyToken, async (req: Request, res: Response) => {
  try {
    // Retrieve all Products from the database
    const user = getUserIdFromtoken(req);
    const product = req.query.productId as string | undefined;
    let products;
    if (product) {
      products = await Product.findOne({ user, id: product });
    }
    res.json(products);
  } catch (error) {
    console.error('Error in getting a Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Product API
router.put('/update/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    // Extract Product ID from the request parameters
    const { id } = req.params;

    // Extract updated Product details from the request body
    const { name, orientation, inclination, area, longitude, latitude } =
      req.body as Omit<CreateProductBody, 'project'>;

    const user = getUserIdFromtoken(req);

    const haveAccess = await Product.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: 'Unauthorized' });
    }

    const existingProduct = await Product.findOne({
      name,
      project: haveAccess.project,
    });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product name already exists!' });
    }

    // Update the Product name using the updateOne method
    const result = await Product.updateOne(
      { id },
      {
        $set: {
          name,
          orientation,
          inclination,
          area,
          longitude,
          latitude,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error in update Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Product API
router.delete('/delete/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    // Extract product ID from the request parameters
    const { id } = req.params;
    const user = getUserIdFromtoken(req);
    const haveAccess = await Product.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: 'Unauthorized' });
    }

    // Delete the product by ID
    const result = await Product.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in delete Product API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
