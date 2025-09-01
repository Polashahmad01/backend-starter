import jwt, { SignOptions, JsonWebTokenError, TokenExpiredError, VerifyOptions } from "jsonwebtoken";
import { config } from "../config";
import { TokenPayload, UnauthorizedError } from "../types/auth";

// Generate an access token
export const generateAccessToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  const signOptions: SignOptions = {
    expiresIn: parseInt(config.jwt.accessExpiresIn, 10),
    issuer: config.app.name,
    audience: config.app.url
  }  
  return jwt.sign(payload, config.jwt.accessSecret, signOptions);
}

// Generate a refresh token
export const generateRefreshToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  const signOptions: SignOptions = {
    expiresIn: parseInt(config.jwt.refreshExpiresIn, 10),
    issuer: config.app.name,
    audience: config.app.url
  }
  return jwt.sign(payload, config.jwt.refreshSecret, signOptions);
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
