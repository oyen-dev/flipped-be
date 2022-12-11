const { ConflictError, ForbiddenError, BadRequestError, DocumentNotFoundError } = require('../errors')
const { bindAll } = require('../utils/classBinder')
const { submitStudentPresenceSchema } = require('../validators/schema/presenceSchema')

class PresenceController {
  constructor(presenceService, classService, validator, response) {
    this.presenceService = presenceService
    this.classService = classService
    this.response = response
    this.validator = validator

    bindAll(this)
  }

  async getAllPresences(req, res) {
    const classroom = await this.classService.getClass(req.params.classId)

    if (!this.classService.isTeacherInClass(classroom, req.user)) {
      throw new ForbiddenError()
    }

    const presences = this.presenceService.getAllPresences(classroom)
    res.json(
      this.response.success(200, 'Get all presences success', presences)
    )
  }

  async getPresenceOpenStatus(req, res) {
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

  async addPresence(req, res) {
    const payload = req.body
    this.validator.validateAddPresence(payload)

    const classroom = await this.classService.getClass(req.params.classId)

    if (!this.classService.isTeacherInClass(classroom, req.user)) {
      throw new ForbiddenError()
    }

    if (this.presenceService.filterCurrentPresence(classroom.presences)) {
      throw new ConflictError('There is an opened presence in this class')
    }

    const presence = await this.presenceService.addPresence(
      payload, classroom)

    res.status(201).send(
      this.response.success(201, 'Add presence sucess', presence)
    )
  }

  async submitStudentPresence(req, res) {
    const { attendance, reaction } = await submitStudentPresenceSchema.validateAsync(req.body)
    const classroom = await this.classService.getClass(req.params.classId)

    // Check is there an active presence
    const activePresence = this.presenceService.filterCurrentPresence(classroom.presences)
    if (!activePresence) {
      throw new DocumentNotFoundError('Active Presence')
    }

    // Check is the student has submitted presence before
    if(await this.presenceService.isStudentHasSubmittedPresence(activePresence, req.user._id)) {
      throw new ForbiddenError('student has submitted presence before')
    }

    await this.presenceService.addStudentPresence(
      attendance,
      reaction,
      req.user._id,
      activePresence
    )
    res.json(this.response.success(200, 'Presence submission has been recorded', true))
  }
}

module.exports = {
  PresenceController
}
