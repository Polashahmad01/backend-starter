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
      // Verify refresh token
      const payload = verifyRefreshToken(refreshTokenValue);

      // Find refresh token in database
      const refreshToken = await RefreshToken.findOne({ token: refreshTokenValue, isRevoked: false });
      if(!refreshToken || !refreshToken.isValid()) {
        throw new UnauthorizedError("Invalid refresh token");
      }

      // if(!refreshToken || (refreshToken.isValid && !refreshToken.isValid())) { //Might be an error
      //   throw new UnauthorizedError("Invalid refresh token");
      // }

      // Find user
      const user = await User.findById(payload.userId);
      if(!user) {
        throw new UnauthorizedError("User not found or account");
      }

      // Revoke old refresh token
      await refreshToken.revoke("token_rotation");

      // if(refreshToken.revoke) { // Might be an error
      //   await refreshToken.revoke("token_rotation");
      // }

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
}

// Export singleton instance
export const authService = new AuthService();
