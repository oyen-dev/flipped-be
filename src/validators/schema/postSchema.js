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

const updatePostSchema = Joi.object({
  classId: Joi.string().required(),
  teacherId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  attachments: Joi.array().items(Joi.string()),
  isTask: Joi.boolean().truthy('true', 'yes', 1, '1').falsy('false', 'no', 0, '0').required(),
  taskId: Joi.string().allow(''),
  deadline: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().required()
  }).allow('')
})

const getClassPostSchema = Joi.object({
  classId: Joi.string().required(),
  postId: Joi.string().required()
})

const deleteClassPostSchema = Joi.object({
  classId: Joi.string().required(),
  postId: Joi.string().required()
})

const createSubmissionSchema = Joi.object({
  taskId: Joi.string().required(),
  studentId: Joi.string().required(),
  answers: Joi.string().allow(''),
  attachments: Joi.array().items(Joi.string()),
  reaction: Joi.number().required()
})

module.exports = {
  createPostSchema,
  getClassPostSchema,
  updatePostSchema,
  deleteClassPostSchema,
  createSubmissionSchema
}
