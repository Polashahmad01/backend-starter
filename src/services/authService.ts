import colors from "colors";
import { 
  User,
  RefreshToken
} from "../models";
import { 
  AuthResponse,
  IAuthService,
  RegisterRequest,
  AuthError,
  NotFoundError,
  LoginRequest,
  UnauthorizedError
} from "../types/auth";
import { 
  hashPassword,
  generateSecureToken,
  comparePassword
} from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { emailService } from "./emailService";

export class AuthService implements IAuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email });
      if(existingUser) {
        throw new AuthError("Email already exists", 409, "EMAIL_EXISTS");
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Generate email verification token
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = new User({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerificationToken,
        emailVerificationExpires,
      });

      await user.save();

      // Generate tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      }

      const accessToken = generateAccessToken(tokenPayload);
      const refreshTokenValue = generateRefreshToken(tokenPayload);

      // Store refresh token
      const refreshToken = new RefreshToken({
        token: refreshTokenValue,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await refreshToken.save();

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, emailVerificationToken, user.firstName);
      } catch(error) {
        console.error(colors.bgRed.white.bold("Failed to send verification email: "), error);
        throw new Error("Failed to send verification email");
      }

      // Return AuthResponse response
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
          accessToken,
          refreshToken: refreshTokenValue
        }
      }

    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Registration failed", 500, "REGISTRATION_FAILED");
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() }
      });

      if(!user) {
        throw new NotFoundError("Invalid or expired verification token.");
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;

      await user.save();

    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Email verification failed", 500, "EMAIL_VERIFICATION_FAILED");
    }
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: data.email });
      if(!user) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Check if user has a password (local auth users)
      if(!user.password) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await comparePassword(data.password, user.password);
      if(!isPasswordValid) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // Generate tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      }

      const accessToken = generateAccessToken(tokenPayload);
      const refreshTokenValue = generateRefreshToken(tokenPayload);

      // Store refresh token
      const refreshToken = new RefreshToken({
        token: refreshTokenValue,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await refreshToken.save();

      // Return AuthResponse
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
          accessToken,
          refreshToken: refreshTokenValue
        }
      }

    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Login failed", 500, "LOGIN_FAILED");
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshTokenValue: string): Promise<void> {
    try {
      const refreshToken = await RefreshToken.findOne({ token: refreshTokenValue });

      if(refreshToken && refreshToken.revoke) {
        await refreshToken.revoke("logout");
      }

    } catch(error) {
      console.error(colors.bgRed.white.bold("Logout error: "), error);
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if(!user) {
        // Don't reveal if email exists or not
        return;
      }

      const resetToken = generateSecureToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;

      await user.save();

      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
      } catch(error) {
        console.error(colors.bgRed.white.bold("Failed to send password reset email: "), error);
        throw new AuthError("Failed to send password reset email.", 500, "EMAIL_SEND_FAILED");
      }

    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Password reset request failed", 500, "PASSWORD_RESET_FAILED");
    }
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
      });

      if(!user) {
        throw new NotFoundError("Invalid or expired reset token");
      }

      const hashedPassword = await hashPassword(password);
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;

      await user.save();

      // Revoke all refresh tokens for security
      await RefreshToken.updateMany(
        { userId: user._id, isRevoked: false },
        { isRevoked: true, revokedAt: new Date(), revokedReason: "password_reset" }
      );

    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Password reset failed", 500, "PASSWORD_RESET_FAILED");
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenValue: string): Promise<AuthResponse> {
    try {
      // console.log(colors.bgBlue.white.bold("🔍 REFRESH TOKEN DEBUG:"), "Token received:", refreshTokenValue.substring(0, 50) + "...");
      
      // First, find refresh token in database to ensure it exists and is valid
      const refreshToken = await RefreshToken.findOne({ token: refreshTokenValue, isRevoked: false });
      // console.log(colors.bgBlue.white.bold("🔍 DATABASE CHECK:"), "Token found:", !!refreshToken, "Is valid:", refreshToken?.isValid());
      
      if(!refreshToken || !refreshToken.isValid()) {
        // console.log(colors.bgRed.white.bold("❌ VALIDATION FAILED:"), "Token not found or invalid");
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      // Then verify the JWT token structure and expiration
      const payload = verifyRefreshToken(refreshTokenValue);
      // console.log(colors.bgBlue.white.bold("🔍 JWT VERIFICATION:"), "Payload:", payload);

      // Find user
      const user = await User.findById(payload.userId);
      if(!user) {
        // console.log(colors.bgRed.white.bold("❌ USER NOT FOUND:"), payload.userId);
        throw new UnauthorizedError("User not found");
      }

      // Ensure the token belongs to the correct user
      if(refreshToken.userId !== user._id.toString()) {
        // console.log(colors.bgRed.white.bold("❌ USER MISMATCH:"), "Token user:", refreshToken.userId, "Payload user:", user._id.toString());
        throw new UnauthorizedError("Token user mismatch");
      }

      // console.log(colors.bgGreen.white.bold("✅ ALL VALIDATIONS PASSED"));

      // Revoke old refresh token
      await refreshToken.revoke("token_rotation");

      // Generate new tokens
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
      }

      const accessToken = generateAccessToken(tokenPayload);
      const newRefreshTokenValue = generateRefreshToken(tokenPayload);

      // Store new refresh token
      const newRefreshToken = new RefreshToken({
        token: newRefreshTokenValue,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await newRefreshToken.save();

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
          accessToken,
          refreshToken: newRefreshTokenValue
        }
      }
    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Token refresh failed", 500, "TOKEN_REFRESH_FAILED");
    }
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string) {
    try {
      const user = await User.findById(userId).select("-password");
      
      if(!user) {
        throw new NotFoundError("User not found");
      }

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

    } catch(error) {
      if(error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Failed to get user profile", 500, "GET_PROFILE_FAILED");
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
