import express from "express";
import type { Request, Response } from "express";
import { verifyToken } from "../commonFunctions.js";
import { User } from "../db/index.js";
import { supabaseAdmin } from "../supabaseAdmin.js";

const router = express.Router();

// Signup, login, password change and password reset are handled by Supabase
// Auth directly from the client (supabase.auth.signUp / signInWithPassword /
// updateUser / resetPasswordForEmail) — no server routes needed.

// Delete Account API — removes both the Supabase auth user and the Mongo
// user record. Users can only delete their own account.
router.delete("/:email", verifyToken, async (req: Request, res: Response) => {
  const { email } = req.params;

  if (email !== req.userEmail || !req.authUserId) {
    return res.status(403).json({ error: "You can only delete your own account!" });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.authUserId);
    if (error) {
      console.error("Error deleting Supabase auth user:", error);
      return res.status(500).json({ error: "Internal server error!" });
    }

    await User.findOneAndDelete({ email });

    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

export default router;
