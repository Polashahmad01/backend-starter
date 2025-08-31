import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { TokenPayload } from "../types/auth";

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
