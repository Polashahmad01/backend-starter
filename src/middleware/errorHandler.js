import ErrorResponse from "../utils/errorResponse.js"

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let errorObj = {...err}

  errorObj.message = err.message

  console.log(err.stack.red)

  if(process.env.NODE_ENV === "development") {
    console.log(err.name)
  }

  if(err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404
    errorObj.message = new ErrorResponse("Resource not found.", 404)
  }

  res.status(statusCode).json({ success: false, error: errorObj.message || "Server Error" })
}

export {
  errorHandler
}
