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
  getUserSchema,
  editPictureSchema,
  addClassSchema,
  getClassesSchema,
  getClassSchema,
  archiveClassSchema,
  deleteClassSchema,
  joinClassSchema,
  uploadAttachmentSchema,
  createPostSchema
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

  validateEditPicture (payload) {
    const { error } = editPictureSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateAddClass (payload) {
    const { error } = addClassSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateGetClasses (payload) {
    const { error } = getClassesSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateGetClass (payload) {
    const { error } = getClassSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateArchiveClass (payload) {
    const { error } = archiveClassSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateDeleteClass (payload) {
    const { error } = deleteClassSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateJoinClass (payload) {
    const { error } = joinClassSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateUploadAttachment (payload) {
    const { error } = uploadAttachmentSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }

  validateCreatePost (payload) {
    const { error } = createPostSchema.validate(payload)
    if (error) throw new ClientError(error.message, 400)
  }
}

module.exports = {
  Validator
}
