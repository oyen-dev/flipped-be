const crypto = require('crypto')
const { Token } = require('../models')

class AuthService {
  constructor () {
    this.name = 'authService'
  }

  async checkActiveToken (email) {
    return await Token.findOne({ email })
  }

  async findTokenByToken (token) {
    return await Token.findOne({ token })
  }

  async createToken (user) {
    const { email } = user

    // Check if token already exist
    const token = await this.checkActiveToken(email)
    if (token) return token

    return await Token.create({
      email,
      token: crypto.randomBytes(20).toString('hex'),
      expiresIn: new Date()
    })
  }

  async deleteToken (email) {
    return await Token.findOneAndDelete({ email })
  }
}

module.exports = {
  AuthService
}
