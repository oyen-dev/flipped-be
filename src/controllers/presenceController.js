const { bindAll } = require('../utils/classBinder')

class PresenceController {
  constructor (presenceService, classService, validator, response) {
    this.presenceService = presenceService
    this.classService = classService
    this.response = response
    this.validator = validator

    bindAll(this)
  }

  async getPresences (req, res) {
    const classroom = await this.classService.getClass(req.params.classId)
    res.send('')
  }

  async addPresence (req, res) {
    const payload = req.body
    this.validator.validateAddPresence(payload)

    res.status(201).send('')
  }
}

module.exports = {
  PresenceController
}
