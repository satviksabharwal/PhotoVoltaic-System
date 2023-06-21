import express from "express";
import {verifyToken, getUserIdFromtoken} from "../commonFunctions.js"
import { Product } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Define the route for creating a new product
router.post("/create", verifyToken, async (req, res) => {
  try {
    // Extract the product data from the request body
    const { name, powerPeak, orientation, inclination, area, longitude, latitude, project } = req.body;

    const user = getUserIdFromtoken(req);
    const existingProduct = await Product.findOne({ name, user });
    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists!" });
    }

    // Generate a unique ID using UUID
    const id = uuidv4();

    // Create a new product instance
    const product = new Product({
      id,
      name,
      powerPeak,
      orientation,
      inclination,
      area,
      longitude,
      latitude,
      user,
      project
    });

    // Save the product to the database
    await product.save();

    res.json({ message: "Product created successfully" });    
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ error: "Failed to create the product" });
  }
});

// Get All Products API
router.get("/", verifyToken, async(req, res) => {
  try {
    // Retrieve all Products from the database
    const user = getUserIdFromtoken(req);
    const projects = await Product.find({user});
    res.json(projects);
  } catch (error) {
    console.error("Error in get all products API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

