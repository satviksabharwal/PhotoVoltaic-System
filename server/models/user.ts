import mongoose from "mongoose";

// User Schema and Model.
// Authentication lives in Supabase; this record keys application data (the
// `user` refs on projects/products/pvDetails) until Phase 3 moves it to
// Postgres. `password` only exists on pre-Supabase accounts.
export interface IUser {
  displayName?: string;
  email: string;
  password?: string;
}

export const userSchema = new mongoose.Schema<IUser>({
  displayName: String,
  email: { type: String, required: true, unique: true },
  password: String,
});
