const { ClientError } = require('../errors')
const { registerSchema, loginSchema } = require('./schema/authSchema')

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
}

module.exports = {
  Validator
}
