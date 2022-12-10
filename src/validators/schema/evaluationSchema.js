const Joi = require('joi')

const createQuestionSchema = Joi.object({
  question: Joi.string().required(),
  options: Joi.array().items(Joi.string()).required(),
  key: Joi.string().required()
})

const getQuestionShema = Joi.object({
  questionId: Joi.string().required()
})

const createEvaluationSchema = Joi.object({
  classId: Joi.string().required(),
  teacherId: Joi.string().required(),
  title: Joi.string().required(),
  questions: Joi.array().items(Joi.string()).required(),
  deadline: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required()
  }).required()
})

const getClassEvaluationsSchema = Joi.object({
  classId: Joi.string().required()
})

const getEvaluationDetailSchema = Joi.object({
  evaluationId: Joi.string().required()
})

module.exports = {
  createQuestionSchema,
  getQuestionShema,
  createEvaluationSchema,
  getClassEvaluationsSchema,
  getEvaluationDetailSchema
}
