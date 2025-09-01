import jwt, { SignOptions, JsonWebTokenError, TokenExpiredError, VerifyOptions } from "jsonwebtoken";
import { config } from "../config";
import { TokenPayload, UnauthorizedError } from "../types/auth";

// Generate an access token
export const generateAccessToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: config.app.name,
    audience: config.app.url
  } as SignOptions);
}

// Generate a refresh token
export const generateRefreshToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.app.name,
    audience: config.app.url
  } as SignOptions);
}

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const verifyOptions: VerifyOptions = {
      issuer: config.app.name,
      audience: config.app.url
    }

    return jwt.verify(token, config.jwt.refreshSecret, verifyOptions) as TokenPayload;
    
  } catch(error) {
    if(error instanceof JsonWebTokenError) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    if(error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Refresh token expired");
    }
    throw new UnauthorizedError("Token verification failed");
  }
}
