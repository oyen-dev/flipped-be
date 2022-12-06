const { UnauthorizedError } = require('../errors')

const getTokenVerifier = (userService, tokenize, responder) => async (req, res, next) => {
  const token = req.headers.authorization

  // Ensure token is exist
  if (!token) throw new UnauthorizedError()

  // Validate token
  const { _id } = await tokenize.verify(token)

  // Verify user based on token
  const user = await userService.findUserById(_id)
  if (!user) throw new UnauthorizedError()

  req.user = user
  next()
}

module.exports = {
  getTokenVerifier
}
