import jwt, { JsonWebTokenError, SignOptions, TokenExpiredError, VerifyOptions } from "jsonwebtoken";
import { appConfig } from "../config";
import { TokenPayload, UnauthorizedError } from "../types";

// Generate an access token
export const generateAccessToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, appConfig.jwt.accessSecret, {
    expiresIn: appConfig.jwt.accessExpiresIn,
    issuer: appConfig.application.appName,
    audience: appConfig.application.appUrl
  } as SignOptions);
}

// Generate a refresh token
export const generateRefreshToken = (payload: Omit<TokenPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, appConfig.jwt.refreshSecret, {
    expiresIn: appConfig.jwt.refreshExpiresIn,
    issuer: appConfig.application.appName,
    audience: appConfig.application.appUrl
  } as SignOptions);
}

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const verifyOptions: VerifyOptions = {
      issuer: appConfig.application.appName,
      audience: appConfig.application.appUrl
    }

    return jwt.verify(token, appConfig.jwt.refreshSecret, verifyOptions) as TokenPayload;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Refresh token expired");
    }
    throw new UnauthorizedError("Token verification failed");
  }
}

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw new UnauthorizedError("Authorization header missing");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new UnauthorizedError("Invalid authorization header format");
  }

  return parts[1]!;
}

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, appConfig.jwt.accessSecret, {
      issuer: appConfig.application.appName,
      audience: appConfig.application.appUrl
    }) as TokenPayload;

  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError("Invalid access token");
    }
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError("Access token expired");
    }

    throw new UnauthorizedError("Token verification failed");
  }
}

