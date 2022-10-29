const Joi = require('joi')

const addClassSchema = Joi.object({
  name: Joi.string().required(),
  grade: Joi.string().required(),
  teachers: Joi.array().items(Joi.string()).required(),
  schedule: Joi.array().items(Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required()
  })).required()
})

const getClassesSchema = Joi.object({
  q: Joi.string().allow(''),
  tId: Joi.string().allow(''),
  sId: Joi.string().allow(''),
  archived: Joi.string().allow(''),
  deleted: Joi.string().allow(''),
  page: Joi.number().integer().min(1).required(),
  limit: Joi.number().integer().min(1).required()
})

const getClassSchema = Joi.object({
  id: Joi.string().required()
})

const archiveClassSchema = Joi.object({
  id: Joi.string().required(),
  archive: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required()
})

module.exports = {
  addClassSchema,
  getClassesSchema,
  getClassSchema,
  archiveClassSchema
}
