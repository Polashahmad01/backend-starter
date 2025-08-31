import { Document } from "mongoose";

// User roles for RBAC
export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

// Base interfaces
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshToken extends Document {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
}

// Configuration types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  baseApiUrl: string;
  healthCheckApiUrl: string;
  database: {
    mongoUserName: string;
    mongoPassword: string;
    mongoDbName: string;
  },
  security: {
    bcryptRounds: number;
    cookieSecret: string;
  },
  cors: {
    origin: string | string[];
  },
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  },
  app: {
    name: string;
    url: string;
    frontendUrl: string;
  },
  email: {
    from: string;
    service: string;
    user: string;
    password: string;
  }
}

// Service interfaces
export interface IAuthService {
  register(data: RegisterRequest): Promise<AuthResponse>;
}

export interface IEmailService {
  sendVerificationEmail(email: string, token: string, firstName: string): Promise<void>
}

// Error types
export class AuthError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = "AUTH_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AuthError";
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AuthError {
  constructor(message: string = "Not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class TooManyRequestsError extends AuthError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
    this.name = "TooManyRequestsError";
  }
}

// Request, Response types
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isEmailVerified: boolean;
  },
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
