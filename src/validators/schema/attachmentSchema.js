const Joi = require('joi')

const uploadAttachmentSchema = Joi.object({
  mimetype: Joi.string().valid(
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ).required(),
  size: Joi.number().integer().max(25 * 1024 * 1024).required()
})

module.exports = {
  uploadAttachmentSchema
}
