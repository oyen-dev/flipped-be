const { addPresenceSchema } = require('./schema/presenceSchema')
const { validate } = require('./extension')

class PresenceValidator {
  validateAddPresence (payload) {
    validate(payload, addPresenceSchema)
  }
}

module.exports = {
  PresenceValidator
}
