import express from "express";
import type { Request, Response } from "express";
import { verifyToken } from "../commonFunctions.js";
import { supabaseAdmin } from "../supabaseAdmin.js";

const router = express.Router();

// Signup, login, password change and password reset are handled by Supabase
// Auth directly from the client (supabase.auth.signUp / signInWithPassword /
// updateUser / resetPasswordForEmail) — no server routes needed.

// Delete Account API — removes the Supabase auth user; the profile row and
// all projects/products/readings cascade via foreign keys. Users can only
// delete their own account.
router.delete("/:email", verifyToken, async (req: Request, res: Response) => {
  const { email } = req.params;

  if (email !== req.userEmail || !req.userId) {
    res.status(403).json({ error: "You can only delete your own account!" });
    return;
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.userId);
    if (error) {
      console.error("Error deleting Supabase auth user:", error);
      res.status(500).json({ error: "Internal server error!" });
      return;
    }

    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

export default router;
