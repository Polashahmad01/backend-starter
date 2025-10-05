import { Request, Response, NextFunction } from "express";
import { FirebaseAuthRequest } from "../types";
import { firebaseAuthService, FirebaseAuthService } from "../services";

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

    // Return response
    res.status(200).json({
      success: true,
      message: "Google Sign-In via Firebase successful",
      // data: {
      //   user: result.user,
      //   accessToken: result.tokens.accessToken
      // }
    });

  } catch (error) {
    next(error);
  }
}