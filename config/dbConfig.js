import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${connect.connection.host}`.cyan.underline.bold)
  } catch(error) {
    console.log("Error: ", error)
  }
}

export {
  connectDB
}
