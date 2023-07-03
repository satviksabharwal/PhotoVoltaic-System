import express from "express";
import {verifyToken, getUserIdFromtoken} from "../commonFunctions.js"
import { Product, Project, PvDetails, User } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";
import {generateAndSendPDF} from "../genrateDocument.js"
import moment from "moment/moment.js";

const router = express.Router();

// Get All Projects API
router.get("/", verifyToken, async(req, res) => {
  try {
    // Retrieve all projects from the database
    const user = getUserIdFromtoken(req);
    const project = req.query.projectId;
    let projects;
    if(project){
      projects = await Project.findOne({user, id: project});
    } else {
      projects = await Project.find({user});
    }
    
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
    const createdDate = moment().format('YYYY-MM-DD')
    
    // Create a new project
    const project = new Project({
      id,
      name,
      user,
      createdDate 
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

    const existingProject = await Project.findOne({ name, user });
    if (existingProject) {
      return res.status(400).json({ error: "Project name already exists!" });
    }

    // Update the project name using the updateOne method
    const result = await Project.updateOne({ id }, { $set: { name } });

    if (result.n === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project updated successfully" , result: {name : name }} );
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
    const user = getUserIdFromtoken(req);
    const haveAccess = await Project.findOne({ user, id });
    if (!haveAccess) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    // Delete the project by ID

    const result = await Promise.all([
      Project.deleteOne({ id }),
      Product.deleteMany({ project: id })
    ]);

    // await Project.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error in delete project API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get PV data API
router.get("/getPVData", verifyToken, async(req, res) => {
  try {
    // Retrieve all pvDetails from the database
    // const user = getUserIdFromtoken(req);
    const project = req.query.projectId;
    const product = req.query.productId;
    if(!project && !product) {
      return res.json({message: 'Provide any one product or project id'});
    }
    if(project && product) {
      return res.json({message: 'Provide any one product or project id'});
    }
    if(project){
      // await PvDetails.deleteMany();
      const pvDetails = await PvDetails.find({project});
      return res.json(pvDetails);
    } else if(product){
      // await PvDetails.deleteMany();
      const pvDetails = await PvDetails.findOne({product});
      return res.json(pvDetails);
    } 
    return res.json({message: 'No able to fetch'});
    
  } catch (error) {
    console.error("Error in get pv details API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  
});

// Get Generate data API
router.get("/generateApi/:id", verifyToken, async(req, res) => {
  try {
    // Retrieve all pvDetails from the database
    const user = getUserIdFromtoken(req);
    const project = req.params.id;
    let pvDetails;
    if(project){
      // await PvDetails.deleteMany();
      pvDetails = await PvDetails.find({project, user}).lean();
    } 
  const projectDetails = await Project.findOne({id: project}).lean();
  if(projectDetails?.isReportGeneratd){
    // return res.status(400).json({ message: "Report already generated" });
  }
  const userDetails = await User.findOne({_id: user}).lean();
  if( pvDetails && userDetails) {
    generateAndSendPDF(pvDetails, userDetails.email,projectDetails)
    .then(async () => {
      console.log('PDF sent successfully!');
      const result = await Project.updateOne({ id: project }, { $set: { isReportGeneratd: true } });
      if (result) {
        res.json({ message: `Report sent to email` });
      }
      
    })
    .catch((error) => {
      console.error('Error sending PDF:', error);
    });
  }
  
  
    // res.json(pvDetails);
  } catch (error) {
    console.error("Error in get pv details API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  
});

export default router;
