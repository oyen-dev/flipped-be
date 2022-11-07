const Joi = require('joi')

const createPostSchema = Joi.object({
  classId: Joi.string().required(),
  teacherId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  attachments: Joi.array().items(Joi.string()),
  isTask: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required(),
  deadline: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required()
  })
})

module.exports = {
  createPostSchema
}
