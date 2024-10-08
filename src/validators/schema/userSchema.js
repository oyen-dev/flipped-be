const Joi = require('joi')

const getUserProfileSchema = Joi.object({
  id: Joi.string().required()
})

const addUserSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  gender: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required(),
  dateOfBirth: Joi.date().required(),
  placeOfBirth: Joi.string().required(),
  address: Joi.string().required()
})

const editUserSchema = Joi.object({
  id: Joi.string().required(),
  fullName: Joi.string().required(),
  gender: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required(),
  dateOfBirth: Joi.date().required(),
  placeOfBirth: Joi.string().required(),
  address: Joi.string().required(),
  phone: Joi.string().allow('')
})

const deleteUserSchema = Joi.object({
  id: Joi.string().required()
})

const getUsersSchema = Joi.object({
  q: Joi.string().allow(''),
  page: Joi.number().integer().min(1).required(),
  limit: Joi.number().integer().min(1).required(),
  deleted: Joi.string().allow('')
})

const getUserSchema = Joi.object({
  id: Joi.string().required()
})

const editPictureSchema = Joi.object({
  mimetype: Joi.string().valid('image/jpeg', 'image/png').required(),
  size: Joi.number().integer().max(2 * 1024 * 1024).required()
})

module.exports = {
  getUserProfileSchema,
  addUserSchema,
  editUserSchema,
  deleteUserSchema,
  getUsersSchema,
  getUserSchema,
  editPictureSchema
}
