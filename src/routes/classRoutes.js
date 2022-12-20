const { MyRouter } = require('../myserver')

class ClassRoutes {
  constructor (classController, postController, presenceRoutes, evaluationController) {
    this.name = 'ClassRouter'
    this.router = MyRouter()
    this._classController = classController
    this._evaluationController = evaluationController
    this._postController = postController

    // Class
    this.router.get('/', this._classController.getClasses)
    this.router.get('/:id', this._classController.getClass)
    this.router.put('/:id', this._classController.updateClass)
    this.router.get('/:id/students', this._classController.getClassStudents)
    this.router.get('/:id/tasks', this._classController.getClassTasks)
    this.router.post('/', this._classController.addClass)
    this.router.post('/archive', this._classController.archiveClass)
    this.router.post('/delete', this._classController.deleteClass)
    this.router.post('/join', this._classController.joinClass)

    // Posts and Submissions
    this.router.post('/:id/post', this._postController.addPost)
    this.router.get('/:id/posts', this._postController.getClassPosts)
    this.router.get('/:id/posts/:postId', this._postController.getClassPost)
    this.router.put('/:id/posts/:postId', this._postController.updateClassPost)
    this.router.delete('/:id/posts/:postId', this._postController.deletePost)
    this.router.get('/:classId/posts/:postId/submission', this._postController.getTaskSubmission)
    this.router.get('/:classId/posts/:postId/submissions', this._postController.getTaskSubmissions)
    this.router.post('/:classId/posts/:postId/submissions', this._postController.addSubmission)
    this.router.get('/:classId/posts/:postId/submissions/:submissionId', this._postController.getTaskSubmissionDetail)
    this.router.put('/:classId/posts/:postId/submissions/:submissionId', this._postController.judgeSubmission)
    this.router.get('/:classId/posts/:postId/status', this._postController.checkSubmissionStatus)
    this.router.put('/:classId/posts/:postId/submissions', this._postController.updateSubmission)

    // Evaluations
    this.router.get('/:classId/evaluations', this._evaluationController.getClassEvaluations)
    this.router.post('/:classId/evaluations', this._evaluationController.createEvaluation)
    this.router.get('/:classId/evaluations/:evaluationId', this._evaluationController.getEvaluationDetail)
    this.router.put('/:classId/evaluations/:evaluationId', this._evaluationController.updateClassEvaluation)
    this.router.delete('/:classId/evaluations/:evaluationId', this._evaluationController.deleteEvaluation)
    this.router.post('/:classId/evaluations/:evaluationId/submit', this._evaluationController.createESubmission)

    // Questions
    this.router.post('/:classId/evaluations/:evaluationId/questions', this._evaluationController.createQuestion)
    this.router.get('/:classId/evaluations/:evaluationId/questions/:questionId', this._evaluationController.getQuestion)
    this.router.put('/:classId/evaluations/:evaluationId/questions/:questionId', this._evaluationController.updateQuestion)
    this.router.delete('/:classId/evaluations/:evaluationId/questions/:questionId', this._evaluationController.deleteQuestion)

    // Presence
    this.router.use('/:classId/presences', presenceRoutes.router)
  }
}

module.exports = {
  ClassRoutes
}
