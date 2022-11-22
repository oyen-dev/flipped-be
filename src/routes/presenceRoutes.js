const express = require('express')

class PresenceRoutes {
  constructor (verifyToken, presenceController) {
    const router = express.Router()
    router.get('/', verifyToken, presenceController.getPresences)
    this.router = router
  }
}

module.exports = {
  PresenceRoutes
}
