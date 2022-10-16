const joi = require('joi')

const addClassSchema = joi.object({
  name: joi.string().required(),
  gradeId: joi.string().required(),
  teachers: joi.array().items(joi.string()).required(),
  schedule: joi.array().items(joi.object({
    start: joi.date().required(),
    end: joi.date().required()
  })).required()
})

module.exports = {
  addClassSchema
}
