const Joi = require('joi')

const createQuestionSchema = Joi.object({
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string()).required(),
  key: Joi.string().required()
})

const getQuestionShema = Joi.object({
  questionId: Joi.string().required()
})

module.exports = {
  createQuestionSchema,
  getQuestionShema
}
