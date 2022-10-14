const jwt = require('jsonwebtoken')
const { ClientError } = require('../errors')

class Tokenize {
  constructor () {
    this.name = 'tokenize'
  }

  async sign (user, remember) {
    const { _id } = user
    const SECRET = process.env.JWT_SECRET || 'secret'
    return jwt.sign({ _id }, SECRET, { expiresIn: remember ? '7d' : '1d' })
  }

  async verify (token) {
    token = token.replace('Bearer ', '')

    try {
      const SECRET = process.env.JWT_SECRET || 'secret'
      return jwt.verify(token, SECRET)
    } catch (error) {
      throw new ClientError('Invalid authorization', 401)
    }
  }
}

module.exports = {
  Tokenize
}
