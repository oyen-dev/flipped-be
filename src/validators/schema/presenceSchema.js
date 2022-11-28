const Joi = require('joi')

const addPresenceSchema = Joi.object({
  start: Joi.date().required(),
  end: Joi.date().required()
})

module.exports = {
  addPresenceSchema
}
