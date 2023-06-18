import mongoose from "mongoose";
import { userSchema } from "../models/user.js";

// Connect to MongoDB
mongoose.connect("mongodb+srv://codenagu:b4PFxzRD3djDJAco@cluster0.r58txlc.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const User = mongoose.model("User", userSchema);
