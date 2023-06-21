import express from "express";
import {verifyToken, getUserIdFromtoken} from "../commonFunctions.js"
import { Project } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Get All Projects API
router.get("/", verifyToken, async(req, res) => {
  try {
    // Retrieve all projects from the database
    const user = getUserIdFromtoken(req);
    const projects = await Project.find({user});
    res.json(projects);
  } catch (error) {
    console.error("Error in get all projects API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create", verifyToken, async (req, res) => {
  try {

    // Extract project name from the request body
    const { name } = req.body;
    const user = getUserIdFromtoken(req);
    const existingProject = await Project.findOne({ name, user });
    if (existingProject) {
      return res.status(400).json({ error: "Project name already exists!" });
    }

    // Generate a unique ID using UUID
    const id = uuidv4();

    // Create a new project
    const project = new Project({
      id,
      name,
      user
    });

    // Save the project to the database
    await project.save();

    res.json({ message: "Project created successfully" });
  } catch (error) {
    console.error("Error in create project API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Project API
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    // Extract project ID from the request parameters
    const { id } = req.params;

    // Extract updated project details from the request body
    const { name } = req.body;
    const user = getUserIdFromtoken(req);

    const haveAccess = await Project.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const existingProject = await Project.findOne({ name, id });
    if (existingProject) {
      return res.status(400).json({ error: "Project name already exists!" });
    }

    // Update the project name using the updateOne method
    const result = await Project.updateOne({ id }, { $set: { name } });

    if (result.n === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Error in update project API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Project API
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    // Extract project ID from the request parameters
    const { id } = req.params;

    const haveAccess = await Project.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    // Delete the project by ID
    const result = await Project.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error in delete project API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
