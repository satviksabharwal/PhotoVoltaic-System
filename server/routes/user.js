import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {verifyToken} from "../commonFunctions.js"
import { User } from "../db/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { displayName, email, password } = req.body;

  try {
    // Check if the email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists!" });
    }

    // Generate a salt and hash the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ displayName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password!" });
    }

    // Generate a JSON Web Token (JWT)
    const token = jwt.sign({ userId: user._id }, "secretKey");

    res.json({ displayName: user?.displayName, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

// Change Password API
router.post("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the old password provided with the stored password
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in change password API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:email",verifyToken, async (req, res) => {
  const { email } = req.params;

  try {
    // Find and delete the user by email
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

export default router;
