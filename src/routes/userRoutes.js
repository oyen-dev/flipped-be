const express = require('express')

class UserRoutes {
  constructor (userController) {
    this.router = express.Router()
    this._userController = userController

    this.router.post('/teachers', this._userController.addTeacher)
  }
}

module.exports = {
  UserRoutes
}
