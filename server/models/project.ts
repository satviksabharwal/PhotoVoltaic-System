import mongoose from "mongoose";

// Project Schema and Model
export interface IProject {
  id: string;
  name: string;
  user?: mongoose.Types.ObjectId;
  isReportGeneratd?: boolean;
  createdDate?: Date;
}

export const projectSchema = new mongoose.Schema<IProject>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isReportGeneratd: { type: Boolean },
    createdDate: { type: Date }
  },
  {
    versionKey: false,
    toJSON: {
      transform(doc: unknown, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
        delete ret.user;
      }
    }
  }
);
