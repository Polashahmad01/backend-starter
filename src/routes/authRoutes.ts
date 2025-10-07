import { Router } from "express";
import { validate } from "../middleware";
import {
  registerSchema
} from "../utils/authSchema";
import {
  register,
  googleSignIn
} from "../controllers";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(registerSchema), register);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google Sign-In via Firebase
 * @access  Public
 */
router.post("/google", googleSignIn);

export default router;
