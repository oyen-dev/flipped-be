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

    this.router.post('/:id/post', this._postController.addPost)
    this.router.get('/:id/posts', this._postController.getClassPosts)
    this.router.get('/:id/posts/:postId', this._postController.getClassPost)
    this.router.put('/:id/posts/:postId', this._postController.updateClassPost)
    this.router.delete('/:id/posts/:postId', this._postController.deletePost)

    this.router.get('/:classId/posts/:postId/submissions', this._postController.getTaskSubmissions)
    this.router.post('/:classId/posts/:postId/submissions', this._postController.addSubmission)

    this.router.get('/:classId/posts/:postId/status', this._postController.checkSubmissionStatus)
  }
}

module.exports = {
  ClassRoutes
}
