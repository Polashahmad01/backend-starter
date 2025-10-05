import * as admin from "firebase-admin";
import { User, RefreshToken } from "../models";
import { appConfig } from "../config";
import { AuthError, IUser, ValidationError } from "../types";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";

export class FirebaseAuthService {
  private app: admin.app.App | null = null;
  private initialized = false;

  constructor() { }

  private initializeFirebase(): void {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize Firebase Admin SDK if not already initialized
      if (!admin.apps.length) {
        const serviceAccountKey = appConfig.firebase.serviceAccountKey;

        if (serviceAccountKey) {
          const serviceAccount = JSON.parse(serviceAccountKey);
          this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        } else {
          throw new Error("Firebase configuration missing. Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS.");
        }
      } else {
        this.app = admin.app();
      }

      this.initialized = true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firebase initialization failed: ${error.message}`);
      } else {
        console.error(`Firebase initialization failed: ${error}`);
      }
    }
  }

  /**
   * Verify Firebase ID token and authenticate user
   */
  async verifyFirebaseToken(idToken: string): Promise<any> {
    try {
      // Initialize Firebase if not already done
      this.initializeFirebase();

      // Verify the Firebase ID token cryptographically
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid: firebaseUid, email, name, picture, email_verified } = decodedToken;

      if (!email || !email_verified) {
        throw new ValidationError("Email not verified by Firebase");
      }

      if (!name) {
        throw new ValidationError("Name information not provided by Firebase");
      }

      // Check if user exists by email or firebaseUid
      let user = await User.findOne({
        $or: [
          { email },
          { firebaseUid }
        ]
      });

      if (user) {
        // User exists - update Firebase info if needed
        if (!user.firebaseUid) {
          // Link existing account with Firebase
          user.firebaseUid = firebaseUid;
          user.authProvider = "google";
          user.profilePicture = picture;
          user.isEmailVerified = true; // Firebase users are pre-verified
          user.fullName = name;

          await user.save();
        } else if (user.firebaseUid !== firebaseUid) {
          throw new AuthError("Email is associated with a different Firebase account", 400, "ACCOUNT_CONFLICT");
        }
      } else {
        // Create new user
        user = new User({
          email,
          fullName: name,
          firebaseUid,
          profilePicture: picture,
          authProvider: "google",
          isEmailVerified: true,
        });

        await user.save();
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          firebaseUid: user.firebaseUid,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      }
    } catch (error: any) {
      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      // Handle Firebase Auth specific errors
      if (error.code === 'auth/id-token-expired') {
        throw new ValidationError("Firebase ID token has expired");
      }

      if (error.code === 'auth/id-token-revoked') {
        throw new ValidationError("Firebase ID token has been revoked");
      }

      if (error.code === 'auth/invalid-id-token') {
        throw new ValidationError("Invalid Firebase ID token");
      }

      if (error.code === 'auth/user-disabled') {
        throw new AuthError("User account has been disabled", 403, "USER_DISABLED");
      }

      throw new AuthError(`Firebase authentication failed: ${error.message}`, 400, "FIREBASE_AUTH_ERROR");
    }
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(user: IUser): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate access token
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Generate refresh token
    const refreshTokenValue = generateRefreshToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Store refresh token in database
    const refreshToken = new RefreshToken({
      token: refreshTokenValue,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await refreshToken.save();

    return {
      accessToken,
      refreshToken: refreshTokenValue
    }
  }

  /**
   * Validate Firebase configuration
   */
  static validateConfiguration(): void {
    const serviceAccountKey = appConfig.firebase.serviceAccountKey;

    if (!serviceAccountKey) {
      throw new Error("Firebase configuration missing. Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS environment variable.");
    }

    if (serviceAccountKey) {
      try {
        JSON.parse(serviceAccountKey);
      } catch (error) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON");
      }
    }
  }

  /**
   * Check if Firebase is configured
   */
  static isConfigured(): boolean {
    const serviceAccountKey = appConfig.firebase.serviceAccountKey;
    return !!serviceAccountKey;
  }
}

export const firebaseAuthService = new FirebaseAuthService();
