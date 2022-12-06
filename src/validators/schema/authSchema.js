const Joi = require('joi')

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().required().valid(Joi.ref('password')),
  fullName: Joi.string().required(),
  gender: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required(),
  dateOfBirth: Joi.date().required(),
  placeOfBirth: Joi.string().required(),
  address: Joi.string().required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  remember: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required()
})

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
})

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.ref('password')
})

const checkTokenSchema = Joi.object({
  token: Joi.string().required()
})

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  checkTokenSchema
}
