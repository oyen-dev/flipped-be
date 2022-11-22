const { ClientError } = require('../errors')

const getTokenVerifier = (userService, tokenize, responder) => async (req, res, next) => {
  const token = req.headers.authorization

  try {
    // Ensure token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await tokenize.verify(token)

    // Verify user based on token
    const user = await userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    req.user = user
    next()
  } catch (error) {
    console.log(error)
    responder.error(res, error)
  }
}

module.exports = {
  getTokenVerifier
}
