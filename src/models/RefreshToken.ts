import mongoose, { Schema, Document } from "mongoose";
import { IRefreshToken } from "../types";

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String,
    enum: ["logout", "security_breach", "token_rotation", "manual_revocation"],
    default: "manual_revocation"
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc: Document, ret: any) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for better query performance
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ token: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1, isRevoked: 1 });

// Add methods to the interface
declare module "mongoose" {
  interface Document {
    // isValid?(): boolean;
    isValid(): boolean;
    // revoke?(reason: string): Promise<any>;
    revoke(reason: string): Promise<any>;
  }
}

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function (): boolean {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Method to revoke token
refreshTokenSchema.methods.revoke = function (reason: string): Promise<any> {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
}

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
