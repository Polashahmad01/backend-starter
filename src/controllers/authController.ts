import { Request, Response, NextFunction } from "express";
import {
  FirebaseAuthRequest,
  RegisterRequest
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
      secure: process.env.NODE_ENV === "production",
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