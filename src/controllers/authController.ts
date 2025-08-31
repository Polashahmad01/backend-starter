import { Request, Response, NextFunction } from "express";
import { RegisterRequest } from "../types/auth";

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: RegisterRequest = req.body;

    // Call authService

    // Set refresh token as HttpOnly cookie

    // Return response

  } catch(error) {
    next(error);
  }
}
