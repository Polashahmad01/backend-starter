import { Router } from "express";
import { validate, authenticate } from "../middleware";
import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema
} from "../utils/authSchema";
import {
  register,
  verifyEmail,
  resendVerificationEmail,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getProfile,
  refresh,
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
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post("/logout", logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, getProfile);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", validate(refreshTokenSchema), refresh);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google Sign-In via Firebase
 * @access  Public
 */
router.post("/google", googleSignIn);

export default router;
