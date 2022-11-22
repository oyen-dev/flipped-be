class PresenceController {
  constructor (presenceService, classService) {
    this.presenceService = presenceService
  }

  getPresences (req, res) {
    res.send('')
  }
}

module.exports = {
  PresenceController
}
