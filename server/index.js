import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import userRoutes from "./routes/user.js";

const rawData = fs.readFileSync("./swagger.json");
const swaggerDocument = JSON.parse(rawData);

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/user", userRoutes);

app.get("/api/protected", (req, res) => {
  // Verify the JWT
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, "secretKey");
    const userId = decoded.userId;

    // Handle the protected route logic here
    res.json({ message: "Access granted to protected route", userId });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Start the server
app.listen(5500, () => {
  console.log("Server started on http://localhost:5500");
});
