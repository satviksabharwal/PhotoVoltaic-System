import mongoose from "mongoose";

// PV Details Schema and Model
export const pvDetailsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    product: { type: String, ref: "Product", required: true },
    project: { type: String, ref: "Project", required: true },
    user: { type: String, ref: "User", required: true },
    hourWiseData: { type: mongoose.Schema.Types.Mixed, required: true},
  },
  {
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);
