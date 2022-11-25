const { ConflictError } = require('../errors')
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

    const classroom = await this.classService.getClass(req.params.classId)
    if (this.presenceService.getCurrentPresence(classroom.presences)) {
      throw new ConflictError('There is an opened presence in this class')
    }

    const presence = await this.presenceService.addPresence(payload, classroom)

    res.status(201).send(
      this.response.success(201, 'Add presence sucess', presence)
    )
  }
}

module.exports = {
  PresenceController
}
