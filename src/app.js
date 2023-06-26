import express from "express"
import dotenv from "dotenv"
import morgan from "morgan"
import colors from "colors"
import cookieParser from "cookie-parser"
import cors from "cors"

import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"

// Import files
import { connectDB } from "../config/dbConfig.js"
import { errorHandler } from "./middleware/errorHandler.js"
import userRoutes from "./routes/userRoutes.js"

// Load env vars
dotenv.config()

// Connect to DB
connectDB()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Dev logging middleware
if(process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

// Cors
app.use(cors({
  origin: function (origin, callback) {
    console.log(origin);
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      const msg = `The CORS policy for ${origin} does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}))

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: "Server is ready." })
})

// app.post("/api/v1/users", asyncHandler( async(req, res) => {
//   try {
//     const token = jwt.sign({ name: "Polash Ahmad", age: 23 }, process.env.JWT_SECRET, {
//       expiresIn: "30d"
//     })

//     res.cookie("jwt", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "none",
//       maxAge: 30 * 24 * 60 * 60 * 1000
//     })

//     res.status(200).json({ success: true, data:{ name: "Polash", age: 23 }})
//   } catch(error) {
//     res.status(201).json({ success: false, error })
//   }
// }))


app.post("/api/v1/users/logout", asyncHandler( async(req, res) => {
  try {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0)})
    res.status(200).json({ success: true, message: "Logged out successfully." })
  } catch(error) {
    res.status(201).json({ success: false, error })
  }
}))


// Routes modules
app.use("/api/v1/users", userRoutes)

// Error middleware
app.use(errorHandler)

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
})

process.on("unhandledRejection", (error, promise) => {
  console.log(`Error: ${error.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
})
