import mongoose, { Schema, Document } from "mongoose";
import { IUser, UserRole } from "../types/auth";

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minLength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    required: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    sparse: true
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String,
    sparse: true
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: Document, ret: any) {
      // Remove sensitive fields from JSON output
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    }
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
