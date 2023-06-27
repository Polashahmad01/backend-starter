import express from "express"
const router = express.Router()

import {
  registerUser,
  authUserOrLogin
} from "../controllers/userController.js"

// @desc    Register a new user
// route    POST /api/v1/users
// @access  Public
router.post("/", registerUser)

// @desc    Auth or login user and set token
// route    POST /api/v1/users/auth
// @access  Public
router.post("/auth", authUserOrLogin)

export default router
