import { Router } from "express";
import { googleSignIn } from "../controllers";

const router = Router();

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google Sign-In via Firebase
 * @access  Public
 */
router.post("/google", googleSignIn);

export default router;
