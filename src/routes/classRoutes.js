const express = require('express')

class ClassRoutes {
  constructor (classController, postController) {
    this.name = 'ClassRouter'
    this.router = express.Router()
    this._classController = classController
    this._postController = postController

    this.router.get('/', this._classController.getClasses)
    this.router.get('/:id', this._classController.getClass)
    this.router.get('/:id/students', this._classController.getClassStudents)
    this.router.get('/:id/tasks', this._classController.getClassTasks)
    this.router.get('/:id/evaluations', this._classController.getClassEvaluations)

    this.router.post('/', this._classController.addClass)
    this.router.post('/archive', this._classController.archiveClass)
    this.router.post('/delete', this._classController.deleteClass)
    this.router.post('/join', this._classController.joinClass)

    this.router.get('/:id/posts', this._postController.getClassPosts)
    this.router.get('/:id/posts/:postId', this._postController.getClassPost)
    this.router.post('/:id/post', this._postController.addPost)
  }
}

module.exports = {
  ClassRoutes
}
