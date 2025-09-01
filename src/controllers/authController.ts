import { Request, Response, NextFunction } from "express";
import { 
  RegisterRequest,
  VerifyEmailRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthenticateRequest
} from "../types/auth";
import { authService } from "../services";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: RegisterRequest = req.body;

    // Call authService
    const result = await authService.register(data);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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

  } catch(error) {
    next(error);
  }
}

/**
 * Verify email address
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token }: VerifyEmailRequest = req.body;

    await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully."
    })

  } catch(error) {
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
      secure: process.env.NODE_ENV === "production",
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

  } catch(error) {
    next(error);
  }
}

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get refresh token from cookie first, then from body
    const refreshTokenValue = req.cookies.refreshToken || req.body.refreshToken;

    if(refreshTokenValue) {
      await authService.logout(refreshTokenValue);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    // Return response
    res.status(200).json({
      success: true,
      message: "Logout successful."
    });

  } catch(error) {
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
  } catch(error) {
    next(error);
  }
}

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password }: ResetPasswordRequest = req.body;

    await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: "Password reset successfully."
    });

  } catch(error) {
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
 * Get current user profile
 */
export const getProfile = async (req: AuthenticateRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required"
        }
      });
    }

    // Fetch complete user profile from database
    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      success: true,
      data: {
        user
      }
    })
  } catch(error) {
    next(error);
  }
}
