import mongoose, { Schema, Document } from "mongoose";
import { IUser, UserRole } from "../types";

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
    required: function (this: IUser) {
      // Password is required only for non-OAuth users
      return !this.firebaseUid;
    },
    minLength: 8
  },
  fullName: {
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
  },
  // Firebase OAuth fields
  firebaseUid: {
    type: String,
    sparse: true,
    index: true
  },
  profilePicture: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc: Document, ret: any) {
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
