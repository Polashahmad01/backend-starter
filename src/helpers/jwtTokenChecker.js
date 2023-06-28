import jwt from "jsonwebtoken"

const jwtTokenChecker = (token) => {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  return decodedToken
}

export {
  jwtTokenChecker
}
