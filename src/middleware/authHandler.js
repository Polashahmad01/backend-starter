import asyncHandler from "express-async-handler"
import User from "../models/user.js"
import { jwtTokenChecker } from "../helpers/jwtTokenChecker.js"
import ErrorResponse from "../utils/errorResponse.js"

const protect = asyncHandler(async(req, res, next) => {
  let token;
  token = req.cookies.jwt

  if(token) {
    try {
      const decodedToken = jwtTokenChecker(token)
      req.user = await User.findById(decodedToken.userId).select("-password")
      next()
    } catch(error) {
      return next(new ErrorResponse("Not authorized, invalid token", 401))
    }
  } else {
    return next(new ErrorResponse("Not authorized, no token", 401))
  }
})

export {
  protect
}
