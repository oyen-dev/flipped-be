const express = require('express')

class ClassRoutes {
  constructor (classController) {
    this.name = 'ClassRouter'
    this.router = express.Router()
    this._classController = classController

    this.router.get('/class', this._classController.getClasses)
    this.router.get('/class/:id', this._classController.getClass)
    this.router.post('/class', this._classController.addClass)
  }
}

module.exports = {
  ClassRoutes
}
