import mongoose from "mongoose";

/** A single hourly data point in hourWiseData. */
export interface PvHourEntry {
  dateAndTime: string;
  pvValue: number;
  powerPeak: number;
  area: number;
  inclination: number;
  solarRad: number;
}

// PV Details Schema and Model
export interface IPvDetails {
  id: string;
  product: string;
  project: string;
  user: string;
  hourWiseData: PvHourEntry[];
}

export const pvDetailsSchema = new mongoose.Schema<IPvDetails>(
  {
    id: { type: String, required: true, unique: true },
    product: { type: String, ref: "Product", required: true },
    project: { type: String, ref: "Project", required: true },
    user: { type: String, ref: "User", required: true },
    hourWiseData: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      transform(doc: unknown, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);
