import jwt from "jsonwebtoken";

// Token verification middleware
export function verifyToken(req, res, next) {
  // Get the token from the request header
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify the token
  jwt.verify(token, "secretKey", (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Token is valid, you can access the decoded payload if needed
    // For example, you can get the user ID from `decodedToken.userId`

    next();
  });
}

export function getUserIdFromtoken(req){

  const token = req.header("Authorization");
  if (!token) {
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, "secretKey");
    const userId = decoded.userId;
    return userId;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function calculateElectricityProduced(product, weatherData) {
  // Extract relevant information from the product and weather data
  const { powerPeak, area,inclination  } = product;
  const data  = weatherData;

  // Calculate the total electricity produced for the given product
    const solarRadiation = data?.solar_rad;
    const electricityProduced = (inclination * powerPeak * area) * (solarRadiation ?? 4);
    return electricityProduced
  }