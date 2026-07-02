import mongoose from 'mongoose';
import 'dotenv/config';
import { userSchema } from '../models/user.js';
import { projectSchema } from '../models/project.js';
import { productSchema } from '../models/product.js';
import { pvDetailsSchema } from '../models/pvDetails.js';

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable — see server/.env.example');
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI).catch((error) => {
  console.error('MongoDB connection error:', error);
});

export const User = mongoose.model('User', userSchema);
export const Project = mongoose.model('Project', projectSchema);
export const Product = mongoose.model('Product', productSchema);
export const PvDetails = mongoose.model('PvDetails', pvDetailsSchema);
