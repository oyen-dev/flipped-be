const { ClientError } = require('../errors')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  checkTokenSchema,
  resetPasswordSchema
} = require('./schema/authSchema')
const { addTeacherSchema } = require('./schema/userSchema')

class Validator {
  constructor () {
    this.name = 'Validator'

    this.validateRegister = this.validateRegister.bind(this)
    this.validateLogin = this.validateLogin.bind(this)
    this.validateForgotPassword = this.validateForgotPassword.bind(this)
    this.validateCheckToken = this.validateCheckToken.bind(this)
    this.validateResetPassword = this.validateResetPassword.bind(this)
    this.validateAddTeacher = this.validateAddTeacher.bind(this)
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

  validateCheckToken (payload) {
    const { error } = checkTokenSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateResetPassword (payload) {
    const { error } = resetPasswordSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateAddTeacher (payload) {
    const { error } = addTeacherSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }
}

module.exports = {
  Validator
}
