import mongoose from 'mongoose';
import 'dotenv/config';
import { userSchema } from '../models/user.js';
import { projectSchema } from '../models/project.js';
import { productSchema } from '../models/product.js';
import { pvDetailsSchema } from '../models/pvDetails.js';

const { MONGODB_URI } = process.env;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const User = mongoose.model('User', userSchema);
export const Project = mongoose.model('Project', projectSchema);
export const Product = mongoose.model('Product', productSchema);
export const PvDetails = mongoose.model('PvDetails', pvDetailsSchema);
