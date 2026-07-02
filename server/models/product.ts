import mongoose from 'mongoose';

export type PanelOrientation = 'N' | 'E' | 'S' | 'W';

export interface IProduct {
  id: string;
  name: string;
  orientation: PanelOrientation;
  inclination: number;
  area: number;
  longitude: number;
  latitude: number;
  user: mongoose.Types.ObjectId;
  project: string;
  powerPeak?: number;
  pvValue?: number;
  isReportGeneratdProduct?: boolean;
}

export const productSchema = new mongoose.Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    orientation: { type: String, enum: ['N', 'E', 'S', 'W'], required: true },
    inclination: { type: Number, required: true },
    area: { type: Number, required: true },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: String, ref: 'Project', required: true },
    powerPeak: { type: Number },
    pvValue: { type: Number },
    isReportGeneratdProduct: { type: Boolean },
  },
  {
    versionKey: false,
    toJSON: {
      transform(doc: unknown, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
        delete ret.user;
      },
    },
  }
);
