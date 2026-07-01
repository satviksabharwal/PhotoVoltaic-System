import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import userRoutes from './routes/user.js';
import projectRoutes from './routes/project.js';
import productRoutes from './routes/product.js';
import { executeCorn } from './cornCalculatePS.js';

const rawData = fs.readFileSync('./swagger.json');

const swaggerDocument = JSON.parse(rawData);

// Port comes from the environment (hosting providers inject `PORT`); falls back
// to 5500 for local development.
const PORT = process.env.PORT || 5500;

// Comma-separated list of allowed origins (e.g. "https://app.example.com").
// When unset, CORS stays open — convenient for local dev.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : undefined;

const app = express();
app.use(express.json());
app.use(cors({ origin: allowedOrigins || true }));

app.use('/api/user', userRoutes);

app.use('/api/project', projectRoutes);

app.use('/api/product', productRoutes);

app.get('/api/protected', (req, res) => {
  // Verify the JWT
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    const userId = decoded.userId;

    // Handle the protected route logic here
    res.json({ message: 'Access granted to protected route', userId });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

executeCorn();
