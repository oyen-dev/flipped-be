const { ConflictError, ForbiddenError } = require('../errors')
const { bindAll } = require('../utils/classBinder')

class PresenceController {
  constructor (presenceService, classService, validator, response) {
    this.presenceService = presenceService
    this.classService = classService
    this.response = response
    this.validator = validator

    bindAll(this)
  }

  async getAllPresences (req, res) {
    const classroom = await this.classService.getClass(req.params.classId)
    const presences = this.presenceService.getAllPresences(classroom)
    res.json(
      this.response.success(200, 'Get all presences success', presences)
    )
  }

  async getPresenceOpenStatus (req, res) {
    const classroom = await this.classService.getClass(req.params.classId)
    const currentPresence = this.presenceService.filterCurrentPresence(classroom.presences)
    res.send(this.response.success(
      200,
      'Get presence open status success',
      {
        isOpen: !(!currentPresence)
      }
    ))
  }

  async addPresence (req, res) {
    const payload = req.body
    this.validator.validateAddPresence(payload)

    const classroom = await this.classService.getClass(req.params.classId)

    if(!this.classService.isTeacherInClass(classroom, req.user)) {
      throw new ForbiddenError()
    }

    if (this.presenceService.filterCurrentPresence(classroom.presences)) {
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
