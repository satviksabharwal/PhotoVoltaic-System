import mongoose from "mongoose";

// User Schema and Model
export const userSchema = new mongoose.Schema({
  displayName: String,
  email: String,
  password: String,
});
