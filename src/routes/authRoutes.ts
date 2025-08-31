import { Router } from "express";
import { 
    validate,
    registerSchema,
    verifyEmailSchema
} from "../middleware";
import {
  register,
  verifyEmail
} from "../controllers";

const router = Router();

// Apply rate limiting to all auth routes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(registerSchema), register);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

export default router;
