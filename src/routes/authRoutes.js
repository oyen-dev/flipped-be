const express = require('express')

class AuthRoutes {
  constructor (authContoller) {
    this.router = express.Router()
    this._authController = authContoller

    this.router.post('/register', this._authController.register)
    this.router.post('/login', this._authController.login)
    this.router.get('/me', this._authController.getAuthProfile)
    this.router.post('/forgot-password', this._authController.forgotPassword)
    this.router.post('/reset-password', this._authController.resetPassword)
  }
}

module.exports = {
  AuthRoutes
}
