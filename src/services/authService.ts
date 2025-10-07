import colors from "colors";
import { User, RefreshToken } from "../models";
import {
  IAuthService,
  RegisterRequest,
  AuthError
} from "../types";
import {
  hashPassword,
  generateSecureToken
} from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";
import { emailService } from "./emailService";

export class AuthService implements IAuthService {
  /**
   * Register a new user
   */
  async registerUser(formData: RegisterRequest) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: formData.email });
      if (existingUser) {
        throw new AuthError("Email already exists", 409, "EMAIL_EXISTS");
      }

      // Hash password
      const hashedPassword = await hashPassword(formData.password);

      // Generate email verification token
      const emailVerificationToken = generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = new User({
        email: formData.email,
        password: hashedPassword,
        fullName: formData.fullName,
        emailVerificationToken,
        emailVerificationExpires,
      });

      await user.save();

      // Generate tokens
      const tokenPayload = { userId: user._id, email: user.email, role: user.role };
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
        await emailService.sendVerificationEmail(user.email, emailVerificationToken, user.fullName);
      } catch(error) {
        console.error(colors.bgRed.white.bold("Failed to send verification email: "), error);
        throw new Error("Failed to send verification email");
      }

      // Return AuthResponse response
      return {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken,
          refreshToken: refreshTokenValue
        }
      }

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Registration failed", 500, "REGISTRATION_FAILED");
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
