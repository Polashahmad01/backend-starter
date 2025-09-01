import { Router } from "express";
import { 
    validate,
    registerSchema,
    verifyEmailSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema,
    authenticate
} from "../middleware";
import {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  refresh,
  getProfile
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

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post("/logout", logout);

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
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", validate(refreshTokenSchema), refresh);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, getProfile);

export default router;
