import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"

import User from "../models/user.js"
import ErrorResponse from "../utils/errorResponse.js"

// @desc    Register a new user
// route    POST /api/v1/users
// @access  Public
const registerUser = asyncHandler(async(req, res, next) => {
  try {

    const generateJwtToken = (res, userId) => {
      const token = jwt.sign({ userId}, process.env.JWT_SECRET, {
        expiresIn: "30d"
      })
    
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
    
      return token
    }

    const { name, email, password, isVerified } = req.body

    const existingUser = await User.findOne({ email })
    if(existingUser) {
      return next(new ErrorResponse("User already exits.", 400))
    }

    const newUser = await User.create({ name, email, password, isVerified })
    const formattedNewUser = { id: newUser._id, name: newUser.name, email: newUser.email, isVerified: newUser.isVerified }

    generateJwtToken(res, formattedNewUser.id)

    res.status(201).json({ success: true, data: formattedNewUser })
  } catch(error) {
    return next(new ErrorResponse(error.message || "Internal server error", 500))
  }
})

export {
  registerUser
}
