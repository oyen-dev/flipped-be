const { MyRouter } = require('../myserver')

class AuthRoutes {
  constructor (authContoller) {
    this.router = MyRouter()
    this._authController = authContoller

    this.router.post('/register', this._authController.register)
    this.router.post('/login', this._authController.login)
    this.router.get('/me', this._authController.getAuthProfile)
    this.router.get('/verify', this._authController.verifyAccount)
    this.router.post('/forgot-password', this._authController.forgotPassword)
    this.router.post('/reset-password', this._authController.resetPassword)
    this.router.get('/reset-password', this._authController.checkToken)
  }
}

module.exports = {
  AuthRoutes
}
