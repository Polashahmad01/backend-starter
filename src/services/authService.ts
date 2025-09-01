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
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
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
}

// Export singleton instance
export const authService = new AuthService();
