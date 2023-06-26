import express from "express"
const router = express.Router()

import {
  registerUser
} from "../controllers/userController.js"

// @desc    Register a new user
// route    POST /api/v1/users
// @access  Public
router.post("/", registerUser)

export default router
