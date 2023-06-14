import mongoose from "mongoose";

// User Schema and Model
export const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});