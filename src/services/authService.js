const crypto = require('crypto')
const { Token } = require('../models')

class AuthService {
  constructor () {
    this.name = 'authService'

    this.createToken = this.createToken.bind(this)
    this.checkActiveToken = this.checkActiveToken.bind(this)
  }

  async checkActiveToken (email) {
    return await Token.findOne({ email })
  }

  async createToken (user) {
    const { email } = user

    // Check if token already exist
    const token = await this.checkActiveToken(email)
    if (token) return token

    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + 1)

    return await Token.create({
      email,
      token: crypto.randomBytes(20).toString('hex'),
      expiresIn: expiresIn.toISOString()
    })
  }
}

module.exports = {
  AuthService
}
