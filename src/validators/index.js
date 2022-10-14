const { ClientError } = require('../errors')
const { registerSchema, loginSchema, forgotPasswordSchema } = require('./schema/authSchema')

class Validator {
  constructor () {
    this.name = 'Validator'
  }

  validateRegister (payload) {
    const { error } = registerSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateLogin (payload) {
    const { error } = loginSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateForgotPassword (payload) {
    const { error } = forgotPasswordSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }
}

module.exports = {
  Validator
}
