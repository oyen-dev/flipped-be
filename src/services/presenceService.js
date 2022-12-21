const { bindAll } = require('../utils/classBinder')
const { Presence, StudentPresence, Class } = require('../models')
const { ClientError } = require('../errors')

class PresenceService {
  constructor (classService) {
    this.classService = classService

    bindAll(this)
  }

  async getPresenceById (id) {
    return await Presence.findById(id)
  }

  getAllPresences (classroom) {
    // console.log(classroom)
    return classroom.presences.sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime())
  }

  async addPresence (payload, classroom) {
    const presence = await Presence.create({
      ...payload,
      studentPresences: []
    })

    await this.classService.updateClass(
      classroom._id,
      {
        presences: [
          presence._id,
          ...classroom.presences
        ]
      }
    )

    return presence
  }

  async updatePresence (id, update) {
    return await Presence.findByIdAndUpdate(id, update, {
      new: true
    })
  }

  filterCurrentPresence (presences) {
    const now = new Date()
    return presences.find((presence) => new Date(presence.end).getTime() > now.getTime()) || null
  }

  async addStudentPresence (attendance, reaction, studentId, presence) {
    const currentPresence = await this.getPresenceById(presence._id)
    if (!currentPresence) {
      return null
    }

    const payload = {
      attendance,
      reaction,
      student: studentId,
      at: new Date()
    }

    const studentPresence = await StudentPresence.create(payload)

    await this.updatePresence(presence._id, {
      studentPresences: [
        ...currentPresence.studentPresences,
        studentPresence._id
      ]
    })

    return studentPresence
  }

  async getStudentPresence (studentPresenceId, populateStudent = false) {
    const query = StudentPresence.findById(studentPresenceId)
    if (populateStudent) {
      query.populate('student')
    }
    return await query
  }

  async isStudentHasSubmittedPresence (activePresence, studentId) {
    const presence = await Presence.findById(activePresence._id)
      .populate({
        path: 'studentPresences',
        match: {
          student: studentId
        }
      })
    return !!presence.studentPresences.length
  }

  async checkStudentWasPresent (studenntPresenceId, studentId) {
    return await StudentPresence.find({ _id: studenntPresenceId, student: studentId })
  }

  async getPresenceDetail (classId, presenceId) {
    const classPresence = await Class.findById(classId)

    if (!classPresence) {
      throw new ClientError('Class not found', 404)
    } else if (!classPresence.presences.includes(presenceId)) {
      throw new ClientError('Presence not found', 404)
    }

    const presence = await Presence.findById(presenceId)
      .select('_id start end studentPresences')
      .populate({ path: 'studentPresences', select: '_id student attendance reaction at' })
      .exec()

    return presence
  }

  async checkStudentIsPresent (presenceId, studentId) {
    const presence = await Presence.findById(presenceId)
      .select('_id studentPresences')
      .populate({
        path: 'studentPresences',
        match: {
          student: studentId
        },
        select: '_id attendance reaction'
      })
      .exec()

    return presence
  }
}

module.exports = {
  PresenceService
}
