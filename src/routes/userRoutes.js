const express = require('express')

class UserRoutes {
  constructor (userController) {
    this.router = express.Router()
    this._userController = userController

    this.router.get('/teachers', this._userController.getTeachers)
    this.router.post('/teachers', this._userController.addTeacher)
    this.router.put('/teachers/:id', this._userController.editTeacher)
    this.router.put('/teachers/:id', this._userController.editTeacher)
    this.router.delete('/teachers/:id', this._userController.deleteTeacher)
  }
}

module.exports = {
  UserRoutes
}
