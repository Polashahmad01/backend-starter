import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name cannot be empty."]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email cannot be empty."]
  },
  password: {
    type: String,
    required: [true, "Password cannot be empty."]
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const User = mongoose.model("User", userSchema)

export default User

