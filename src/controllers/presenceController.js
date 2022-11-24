const { bindAll } = require('../utils/classBinder')

class PresenceController {
  constructor (presenceService, classService, response) {
    this.presenceService = presenceService
    this.classService = classService
    this.response = response

    bindAll(this)
  }

  async getPresences (req, res) {
    const classroom = await this.classService.getClass(req.params.classId)
    res.send('')
  }

  async addPresence (req, res) {
    res.send('')
  }
}

module.exports = {
  PresenceController
}
