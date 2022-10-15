const express = require('express')

class UserRoutes {
  constructor (userController) {
    this.router = express.Router()
    this._userController = userController

    this.router.post('/teachers', this._userController.addTeacher)
    this.router.put('/teachers/:id', this._userController.editTeacher)
  }
}

module.exports = {
  UserRoutes
}
