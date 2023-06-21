import mongoose from "mongoose";
import { userSchema } from "../models/user.js";
import { projectSchema } from "../models/project.js";
import { productSchema } from "../models/product.js";

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://satviksabharwal:5cmCTxwHaaKrkutR@cluster0.y2u9jyd.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

export const User = mongoose.model("User", userSchema);
export const Project = mongoose.model("Project", projectSchema);
export const Product = mongoose.model("Product", productSchema);
