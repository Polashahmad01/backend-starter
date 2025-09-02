import { OAuth2Client } from "google-auth-library";
import { 
  User,
  RefreshToken
} from "../models";
import {
  AuthResponse,
  ValidationError,
  AuthError,
  IUser
} from "../types/auth";
import {  
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";
import { config } from "../config";

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.OAuth.googleClientId,
      config.OAuth.googleClientSecret
    );
  }

  /**
   * Verify Google ID token cryptographically and authenticate user
   */
  async verifyGoogleToken(idToken: string): Promise<AuthResponse> {
    try {
      // Verify the ID token cryptographically against Google's public keys
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
  
      if(!payload) {
        throw new ValidationError("Invalid Google ID token");
      }
  
      const { sub: googleId, email, given_name, family_name, picture, email_verified } = payload;

      if(!email || !email_verified) {
        throw new ValidationError("Email not verified by Google");
      }
  
      if(!given_name || !family_name) {
        throw new ValidationError("Name information not provided by Google");
      }

      // Check if user exists by email or googleId
      let user = await User.findOne({
        $or: [
          { email },
          { googleId }
        ]
      });

      if(user) {
        // User exists - update Google info if needed
        if(!user.googleId) {
          // Link existing account with Google
          user.googleId = googleId;
          user.authProvider = "google";
          user.profilePicture = picture;
          user.isEmailVerified = true; // Google users are pre-verified

          await user.save();

        } else if(user.googleId !== googleId) {
          throw new AuthError("Email is associated with a different Google account", 400, "ACCOUNT_CONFLICT");
        }
      } else {
        // Create new user
        user = new User({
          email,
          googleId,
          firstName: given_name,
          lastName: family_name,
          profilePicture: picture,
          authProvider: "google",
          isEmailVerified: true // Google users are pre-verified
        });

        await user.save();

      }
  
      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      }
    } catch(error: any) {
      if(error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      // Handle Google Auth Library specific errors
      if(error.message?.includes("Token used too early") ||
        error.message?.includes("Token used too late") ||
        error.message?.includes("Invalid token signature")) {
          throw new ValidationError("Invalid or expired Google ID token");
      }

      throw new AuthError("Google authentication failed", 400, "GOOGLE_AUTH_ERROR");
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
   * Validate Google Client ID configuration
   */
  static validateConfiguration(): void {
    if(!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID environment variable is required");
    }

    if(!process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("GOOGLE_CLIENT_SECRET environment variable is required");
    }
  }
}

export const googleAuthSerive = new GoogleAuthService();
