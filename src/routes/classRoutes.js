const express = require('express')

class ClassRoutes {
  constructor (classController) {
    this.name = 'ClassRouter'
    this.router = express.Router()
    this._classController = classController

    this.router.get('/class', this._classController.getClasses)
    this.router.get('/class/:id', this._classController.getClass)
    this.router.get('/class/:id/posts', this._classController.getClassPosts)
    this.router.get('/class/:id/students', this._classController.getClassStudents)
    this.router.get('/class/:id/tasks', this._classController.getClassTasks)
    this.router.get('/class/:id/evaluations', this._classController.getClassEvaluations)

    this.router.post('/class', this._classController.addClass)
    this.router.post('/class/archive', this._classController.archiveClass)
    this.router.post('/class/delete', this._classController.deleteClass)
    this.router.post('/class/join', this._classController.joinClass)
  }
}

module.exports = {
  ClassRoutes
}
