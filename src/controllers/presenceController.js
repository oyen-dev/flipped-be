const { bindAll } = require('../utils/classBinder')

class PresenceController {
  constructor (presenceService, classService) {
    this.presenceService = presenceService
    this.classService = classService

    bindAll(this)
  }

  async getPresences (req, res) {
    const classroom = await this.classService.getClass(req.params.classid)
    res.send('')
  }
}

module.exports = {
  PresenceController
}
