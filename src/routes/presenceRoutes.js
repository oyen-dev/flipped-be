const express = require('express')

class PresenceRoutes {
  constructor (verifyToken, needRoles, presenceController) {
    const router = express.Router()
    router.get('/', verifyToken, needRoles(['ADMIN', 'TEACHER']), presenceController.getPresences)
    this.router = router
  }
}

module.exports = {
  PresenceRoutes
}
