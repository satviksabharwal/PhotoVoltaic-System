import express from "express";
import {verifyToken, getUserIdFromtoken} from "../commonFunctions.js"
import { Product, Project } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Define the route for creating a new product
router.post("/create", verifyToken, async (req, res) => {
  try {
    // Extract the product data from the request body
    const { name, powerPeak, orientation, inclination, area, longitude, latitude, project } = req.body;

    const user = getUserIdFromtoken(req);
    const existingProduct = await Product.findOne({ name, user, project });
    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists!" });
    }

    const validProject = await Project.findOne({ id: project});
    if (!validProject) {
      return res.status(400).json({ error: "Project not found" });
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
    console.error("Error in POST product API:", error);
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


// Update Product API
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    // Extract Product ID from the request parameters
    const { id } = req.params;

    // Extract updated Product details from the request body
    const { name, powerPeak, orientation, inclination, area, longitude, latitude } = req.body; 

    const user = getUserIdFromtoken(req);

    const haveAccess = await Product.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const existingProduct = await Product.findOne({ name, id });
    if (existingProduct) {
      return res.status(400).json({ error: "Product name already exists!" });
    }

    // Update the Product name using the updateOne method
    const result = await Product.updateOne({ id }, { $set: { name, powerPeak, orientation, inclination, area, longitude, latitude } });

    if (result.n === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error in update Product API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Product API
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    // Extract product ID from the request parameters
    const { id } = req.params;
    const user = getUserIdFromtoken(req);
    const haveAccess = await Product.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    // Delete the product by ID

    const result = await Product.deleteOne({ id })

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in delete Product API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

