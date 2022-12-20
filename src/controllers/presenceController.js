const { ConflictError, ForbiddenError, DocumentNotFoundError, ClientError } = require('../errors')
const { bindAll } = require('../utils/classBinder')
const { submitStudentPresenceSchema } = require('../validators/schema/presenceSchema')

class PresenceController {
  constructor (presenceService, classService, validator, tokenize, response) {
    this.presenceService = presenceService
    this.classService = classService
    this.response = response
    this._tokenize = tokenize
    this.validator = validator

    bindAll(this)
  }

  async getAllPresences (req, res) {
    const classroom = await this.classService.getClass(req.params.classId)

    if (!this.classService.isTeacherInClass(classroom, req.user)) {
      throw new ForbiddenError()
    }

    const presences = this.presenceService.getAllPresences(classroom)
    res.json(
      this.response.success(200, 'Get all presences success', presences)
    )
  }

  async getPresenceOpenStatus (req, res) {
    const token = req.headers.authorization

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    const classroom = await this.classService.getClass(req.params.classId)
    const currentPresence = this.presenceService.filterCurrentPresence(classroom.presences)

    let isStudentPresent = false
    if (currentPresence) {
      isStudentPresent = await this.presenceService.isStudentHasSubmittedPresence(currentPresence, _id)
    }

    res.send(this.response.success(
      200,
      'Get presence open status success',
      {
        isOpen: !(!currentPresence),
        isStudentPresent: currentPresence ? isStudentPresent : false,
        presence: currentPresence
      }
    ))
  }

  async addPresence (req, res) {
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

  async updatePresence (req, res) {
    const payload = req.body

    // Validate payload
    this.validator.validateAddPresence(payload)

    // Get current presence
    const classroom = await this.classService.getClass(req.params.classId)
    const currentPresence = this.presenceService.filterCurrentPresence(classroom.presences)

    // Update current presence
    await this.presenceService.updatePresence(currentPresence._id, payload)

    res.status(200).send(this.response.success(200, 'Update presence success'))
  }

  async submitStudentPresence (req, res) {
    const { attendance, reaction } = await submitStudentPresenceSchema.validateAsync(req.body)
    const classroom = await this.classService.getClass(req.params.classId)

    // Check is there an active presence
    const activePresence = this.presenceService.filterCurrentPresence(classroom.presences)
    if (!activePresence) {
      throw new DocumentNotFoundError('Active Presence')
    }

    // Check is the student has submitted presence before
    if (await this.presenceService.isStudentHasSubmittedPresence(activePresence, req.user._id)) {
      throw new ForbiddenError('student has submitted presence before')
    }

    const result = await this.presenceService.addStudentPresence(
      attendance,
      reaction,
      req.user._id,
      activePresence
    )
    res.json({ result })
  }

  async getPresenceDetail (req, res) {
    const { classId, presenceId } = req.params

    // Get class student
    let { students } = await this.classService.getClassStudents(classId)

    // Map students
    students = students.map((student) => {
      return {
        _id: student._id,
        fullName: student.fullName,
        picture: student.picture
      }
    })

    // Sort students by fullName
    students.sort((a, b) => {
      const nameA = a.fullName.toUpperCase()
      const nameB = b.fullName.toUpperCase()
      if (nameA < nameB) {
        return -1
      }
      if (nameA > nameB) {
        return 1
      }
      return 0
    })

    // Get presence detail
    const presence = await this.presenceService.getPresenceDetail(classId, presenceId)

    // Map students with their submission
    const studentPresences = []
    for (const student of students) {
      const studentPresence = presence.studentPresences.find((studentPresence) => {
        return studentPresence.student.toString() === student._id.toString()
      })

      if (studentPresence) {
        studentPresences.push({
          student,
          attendance: studentPresence.attendance,
          reaction: studentPresence.reaction,
          at: studentPresence.at
        })
      } else {
        studentPresences.push({
          student,
          attendance: null,
          reaction: null,
          at: null
        })
      }
    }

    // Payload response
    const payload = {
      _id: presence._id,
      start: presence.start,
      end: presence.end,
      studentPresences
    }

    res.json(
      this.response.success(200, 'Get presence detail success', payload)
    )
  }
}

module.exports = {
  PresenceController
}
