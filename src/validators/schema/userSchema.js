const Joi = require('joi')

const getUserProfileSchema = Joi.object({
  id: Joi.string().required()
})

const addTeacherSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  gender: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required(),
  dateOfBirth: Joi.string().required(),
  placeOfBirth: Joi.string().required(),
  address: Joi.string().required()
})

module.exports = {
  getUserProfileSchema,
  addTeacherSchema
}
