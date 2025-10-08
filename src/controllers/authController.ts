import { Request, Response, NextFunction } from "express";
import {
  FirebaseAuthRequest,
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationEmailRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthenticateRequest,
  UnauthorizedError
} from "../types";
import {
  firebaseAuthService,
  FirebaseAuthService,
  authService
} from "../services";
import { appConfig } from "../config";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName }: RegisterRequest = req.body;

    // Call authService
    const result = await authService.registerUser({ email, password, fullName });

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: appConfig.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return response
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Verify email address
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token }: VerifyEmailRequest = req.body;

    const result = await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully — redirecting to your dashboard.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }
    })

  } catch (error) {
    next(error);
  }
}

/**
 * Resend verification email address
 */
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email }: ResendVerificationEmailRequest = req.body;

    const result = await authService.resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: "Verification email Resent successfully — Check your inbox.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      }
    })
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: LoginRequest = req.body;

    const result = await authService.login(data);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: appConfig.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return response
    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Send password reset email
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email }: ForgotPasswordRequest = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password }: ResetPasswordRequest = req.body;

    const result = await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get refresh token from cookie first
    const refreshTokenValue = req.cookies.refreshToken;

    if (!refreshTokenValue) {
      throw new UnauthorizedError("Unable to logout. Refresh token not found");
    }

    await authService.logout(refreshTokenValue);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    // Return response
    res.status(200).json({
      success: true,
      message: "Logout successful."
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
  try {
    // req.user is guaranteed to exist due to authenticate middleware
    const userId = req.user!.userId;

    // Fetch complete user profile from database
    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: {
        user
      },
      message: "User profile fetched successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 */
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;
    if(!refreshTokenValue) {
      return res.status(401).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_REQUIRED",
          message: "Refresh token is required"
        }
      });
    }

    const result = await authService.refreshToken(refreshTokenValue);

    // Set new refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return response
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    })

  } catch(error) {
    next(error);
  }
}

/**
 * Authenticate user with Google Sign-In via Firebase
 */
export const googleSignIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken }: FirebaseAuthRequest = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ID_TOKEN",
          message: "Firebase ID token is required"
        }
      });
    }

    // Check if Firebase is configured
    if (!FirebaseAuthService.isConfigured()) {
      return res.status(500).json({
        success: false,
        error: {
          code: "FIREBASE_NOT_CONFIGURED",
          message: "Firebase authentication is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable."
        }
      });
    }

    // Verify Firebase ID token cryptographically
    const result = await firebaseAuthService.verifyFirebaseToken(idToken);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: appConfig.nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/"
    });

    // Return response
    res.status(200).json({
      success: true,
      message: "Authentication successful — redirecting to your dashboard.",
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken
      }
    });

  } catch (error) {
    next(error);
  }
}