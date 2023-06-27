import asyncHandler from "express-async-handler"

import User from "../models/user.js"
import ErrorResponse from "../utils/errorResponse.js"
import generateJwtToken from "../helpers/generateJwtToken.js"

// @desc    Register a new user
// route    POST /api/v1/users
// @access  Public
const registerUser = asyncHandler(async(req, res, next) => {
  try {
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

// @desc    Auth or login user and set token
// route    POST /api/v1/users/auth
// @access  Public
const authUserOrLogin = asyncHandler(async(req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if(user && (await user.matchPassword(password))) {
      generateJwtToken(res, user._id)
      res.status(200).json({ success: true, data: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified }})
    } else {
      return res.status(400).json({ success: false, message: "Invalid email or password." })
    }
  } catch(error) {
    return next(new ErrorResponse(error.message || "Internal server error", 500))
  }
})

export {
  registerUser,
  authUserOrLogin
}
