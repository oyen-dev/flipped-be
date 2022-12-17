const { MyRouter } = require('../myserver')

class PresenceRoutes {
  constructor (verifyToken, needRole, presenceController) {
    const router = MyRouter({ mergeParams: true })

    router.get('/', verifyToken, needRole(['ADMIN', 'TEACHER']), presenceController.getAllPresences)
    router.post('/', verifyToken, needRole(['ADMIN', 'TEACHER']), presenceController.addPresence)
    router.put('/', verifyToken, needRole(['ADMIN', 'TEACHER']), presenceController.updatePresence)

    router.get('/current', verifyToken, presenceController.getPresenceOpenStatus)
    router.post('/current', verifyToken, needRole(['STUDENT']), presenceController.submitStudentPresence)

    this.router = router
  }
}

module.exports = {
  PresenceRoutes
}
