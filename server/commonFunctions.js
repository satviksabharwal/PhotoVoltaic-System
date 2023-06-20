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