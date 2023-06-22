import mongoose from "mongoose";

export const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    powerPeak: { type: Number, required: true },
    orientation: { type: String, enum: ["N", "E", "S", "W"], required: true },
    inclination: { type: Number, required: true },
    area: { type: Number, required: true },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: String, ref: "Project", required: true }
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

