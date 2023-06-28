import express from "express"
const router = express.Router()

import {
  registerUser,
  authUserOrLogin,
  logoutUser
} from "../controllers/userController.js"
import { protect } from "../middleware/authHandler.js"

// @desc    Register a new user
// route    POST /api/v1/users
// @access  Public
router.post("/", registerUser)

// @desc    Auth or login user and set token
// route    POST /api/v1/users/auth
// @access  Public
router.post("/auth", authUserOrLogin)

// @desc    Logout user
// route    POST /api/v1/users/logout
// @access  Private
router.post("/logout", protect, logoutUser)

export default router
