const { ClientError } = require('../errors')
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  checkTokenSchema,
  resetPasswordSchema,
  addTeacherSchema,
  editTeacherSchema,
  deleteTeacherSchema,
  getTeachersSchema
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

  validateAddTeacher (payload) {
    const { error } = addTeacherSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateEditTeacher (payload) {
    const { error } = editTeacherSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateDeleteTeacher (payload) {
    const { error } = deleteTeacherSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateGetTeachers (payload) {
    const { error } = getTeachersSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }
}

module.exports = {
  Validator
}
