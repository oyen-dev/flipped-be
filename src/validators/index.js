const { ClientError } = require('../errors')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  checkTokenSchema,
  resetPasswordSchema,
  addUserSchema,
  editUserSchema,
  deleteUserSchema,
  getUsersSchema,
  getUserSchema
} = require('./schema')

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

  validateCheckToken (payload) {
    const { error } = checkTokenSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateResetPassword (payload) {
    const { error } = resetPasswordSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateAddUser (payload) {
    const { error } = addUserSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateEditUser (payload) {
    const { error } = editUserSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateDeleteUser (payload) {
    const { error } = deleteUserSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateGetUsers (payload) {
    const { error } = getUsersSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateGetUser (payload) {
    const { error } = getUserSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }
}

module.exports = {
  Validator
}
