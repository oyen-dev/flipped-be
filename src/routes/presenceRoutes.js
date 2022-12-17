const { MyRouter } = require('../myserver')

class PresenceRoutes {
  constructor (verifyToken, needRoles, presenceController) {
    const router = MyRouter({ mergeParams: true })

    router.get('/', verifyToken, needRoles(['ADMIN', 'TEACHER']), presenceController.getAllPresences)
    router.post('/', verifyToken, needRoles(['ADMIN', 'TEACHER']), presenceController.addPresence)
    router.put('/', verifyToken, needRoles(['ADMIN', 'TEACHER']), presenceController.updatePresence)
    router.get('/current', verifyToken, presenceController.getPresenceOpenStatus)

    this.router = router
  }
}

module.exports = {
  PresenceRoutes
}
