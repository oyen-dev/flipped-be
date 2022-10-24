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
  page: Joi.number().integer().min(1).required(),
  limit: Joi.number().integer().min(1).required()
})

const getClassSchema = Joi.object({
  id: Joi.string().required()
})

module.exports = {
  addClassSchema,
  getClassesSchema,
  getClassSchema
}
