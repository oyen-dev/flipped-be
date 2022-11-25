const { bindAll } = require('../utils/classBinder')
const { Presence } = require('../models')

class PresenceService {
  constructor (classService) {
    this.classService = classService

    bindAll(this)
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

  getCurrentPresence (presences) {
    const now = new Date()
    return presences.find((presence) => new Date(presence.end).getTime() > now.getTime()) || null
  }
}

module.exports = {
  PresenceService
}
