const { bindAll } = require('../utils/classBinder')
const { Presence } = require('../models')

class PresenceService {
  constructor (classService) {
    this.classService = classService

    bindAll(this)
  }

  getAllPresences (classroom) {
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

  filterCurrentPresence (presences) {
    const now = new Date()
    return presences.find((presence) => new Date(presence.end).getTime() > now.getTime()) || null
  }
}

module.exports = {
  PresenceService
}
