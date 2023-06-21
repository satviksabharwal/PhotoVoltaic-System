import mongoose from "mongoose";

// User Schema and Model
export const userSchema = new mongoose.Schema({
  displayName: String,
  email: {type: String, required: true, unique: true},
  password: String,
});
