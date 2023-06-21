import mongoose from "mongoose";

// Project Schema and Model
export const projectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.user;
      }
    }
  }
);