const Joi = require('joi')

const addPresenceSchema = Joi.object({
  start: Joi.date().required(),
  end: Joi.date().required()
})

const submitStudentPresenceSchema = Joi.object({
  attendance: Joi.number().min(1).max(3).required(),
  reaction: Joi.number().min(1).max(5).required()
})

module.exports = {
  addPresenceSchema,
  submitStudentPresenceSchema
}
