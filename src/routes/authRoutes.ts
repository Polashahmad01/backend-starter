import { Router } from "express";
import { validate } from "../middleware";
import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from "../utils/authSchema";
import {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  forgotPassword,
  resetPassword,
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
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

/**
 * @route   POST /api/auth/resend-verification-email
 * @desc    Resend verification email
 * @access  Public
 */
router.post("/resend-verification-email", validate(resendVerificationEmailSchema), resendVerificationEmail);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginSchema), login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google Sign-In via Firebase
 * @access  Public
 */
router.post("/google", googleSignIn);

export default router;
