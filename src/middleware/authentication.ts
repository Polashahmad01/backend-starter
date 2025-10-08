import { Response, NextFunction } from "express";
import { UnauthorizedError, AuthenticateRequest } from "../types";
import {
  extractTokenFromHeader,
  verifyAccessToken
} from "../utils/jwt";
import { User } from "../models";

/**
 * Middleware to authenticate requests using JWT access tokens
 */
export const authenticate = async (req: AuthenticateRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    }

    next();
  } catch (error) {
    next(error);
  }
}
