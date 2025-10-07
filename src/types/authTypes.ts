import { Document } from "mongoose";

// User roles for RBAC
export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

// User Object
export interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  // Firebase OAuth fields
  firebaseUid?: string;
  profilePicture?: string;
  authProvider: "local" | "google";
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

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface FirebaseAuthRequest {
  idToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface IAuthService {
  registerUser: (user: RegisterRequest) => void;
}

export interface IEmailService {
  sendVerificationEmail(email: string, token: string, fullName: string): void;
}
