const { MyRouter } = require('../myserver')

class PresenceRoutes {
  constructor (verifyToken, needRoles, presenceController) {
    const router = MyRouter({ mergeParams: true })
    router.get('/', verifyToken, needRoles(['ADMIN', 'TEACHER']), presenceController.getPresences)
    this.router = router
  }
}

module.exports = {
  PresenceRoutes
}
