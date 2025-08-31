import { Request, Response, NextFunction } from "express";
import { RegisterRequest } from "../types/auth";
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
