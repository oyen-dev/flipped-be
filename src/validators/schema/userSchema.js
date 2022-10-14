const Joi = require('joi')

const getUserProfileSchema = Joi.object({
  id: Joi.string().required()
})

module.exports = {
  getUserProfileSchema
}
