const { bindAll } = require('../utils/classBinder')
const { ClientError } = require('../errors')

class EvaluationController {
  constructor (classService, userService, evaluationService, questionService, answerService, eSubmissionService, validator, tokenize, response) {
    this.name = 'EvaluationController'
    this._classService = classService
    this._userService = userService
    this._evaluationService = evaluationService
    this._questionService = questionService
    this._answerService = answerService
    this._eSubmissionService = eSubmissionService
    this._validator = validator
    this._tokenize = tokenize
    this._response = response

    bindAll(this)
  }

  // Questions
  async createQuestion (req, res) {
    const token = req.headers.authorization
    const payload = req.body
    const { evaluationId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Check evaluation is exist
    const evaluation = await this._evaluationService.getEvaluationById(evaluationId)
    if (!evaluation) throw new ClientError('Evaluation not found', 404)

    // Validate payload
    this._validator.validateCreateQuestion(payload)

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to create question', 401)

    // Create question
    const question = await this._questionService.createQuestion(payload)

    // Add question to evaluation
    evaluation.questions.push(question._id)
    await evaluation.save()

    // Response
    const response = this._response.success(200, 'Create question success', { _id: question._id })

    return res.status(response.statsCode || 200).json(response)
  }

  async updateQuestion (req, res) {
    const token = req.headers.authorization
    const { evaluationId, questionId } = req.params
    const payload = req.body

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Check evaluation is exist
    const evaluation = await this._evaluationService.getEvaluationById(evaluationId)
    if (!evaluation) throw new ClientError('Evaluation not found', 404)

    // Validate payload
    this._validator.validateCreateQuestion(payload)

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to update question', 401)

    // Update question
    await this._questionService.updateQuestion(questionId, payload)

    // Response
    const response = this._response.success(200, 'Update question success')

    return res.status(response.statsCode || 200).json(response)
  }

  async deleteQuestion (req, res) {
    const token = req.headers.authorization
    const { evaluationId, questionId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Check evaluation is exist
    const evaluation = await this._evaluationService.getEvaluationById(evaluationId)
    if (!evaluation) throw new ClientError('Evaluation not found', 404)

    // Validate payload
    this._validator.validateGetQuestion({ questionId })

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to update question', 401)

    // Delete question
    await this._questionService.deleteQuestion(questionId)

    // Remove question from evaluation
    evaluation.questions = evaluation.questions.filter(question => question.toString() !== questionId)
    await evaluation.save()

    // Response
    const response = this._response.success(200, 'Delete question success')

    return res.status(response.statsCode || 200).json(response)
  }

  async getQuestion (req, res) {
    const token = req.headers.authorization
    const { questionId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateGetQuestion({ questionId })

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to get question', 401)

    // Get question
    const question = await this._questionService.getQuestionById(questionId)

    // Response
    const response = this._response.success(200, 'Get question success', question)

    return res.status(response.statsCode || 200).json(response)
  }

  // Evaluation
  async createEvaluation (req, res) {
    const token = req.headers.authorization
    const payload = req.body
    const { classId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    payload.classId = classId
    payload.teacherId = _id
    this._validator.validateCreateEvaluation(payload)

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to create evaluation', 401)

    // Find class
    const classData = await this._classService.getClass(classId)

    // Make sure teacher is in class
    let isTeacherInClass = false
    for (const teacher of classData.teachers) {
      if (teacher._id.includes(user._id)) {
        isTeacherInClass = true
        break
      }
    }
    if (!isTeacherInClass) throw new ClientError('Unauthorized to create evaluation', 401)

    // Create evaluation
    const evaluation = await this._evaluationService.createEvaluation(payload)

    // Response
    const response = this._response.success(200, 'Create evaluation success', { _id: evaluation._id })

    return res.status(response.statsCode || 200).json(response)
  }

  async getClassEvaluations (req, res) {
    const token = req.headers.authorization
    const { classId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateGetClassEvaluations({ classId })

    // Get class evaluations
    const evaluations = await this._evaluationService.getClassEvaluations(classId)

    // Response
    const response = this._response.success(200, 'Get class evaluation success', evaluations)

    return res.status(response.statsCode || 200).json(response)
  }

  async updateClassEvaluation (req, res) {
    const token = req.headers.authorization
    const { classId, evaluationId } = req.params
    const payload = req.body

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateUpdateEvaluation(payload)

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to update evaluation', 401)

    // Find class
    const classData = await this._classService.getClass(classId)

    // Make sure teacher is in class
    let isTeacherInClass = false
    for (const teacher of classData.teachers) {
      if (teacher._id.includes(user._id)) {
        isTeacherInClass = true
        break
      }
    }
    if (!isTeacherInClass) throw new ClientError('Unauthorized to update evaluation', 401)

    // Update evaluation
    await this._evaluationService.updateEvaluation(evaluationId, payload)

    // Response
    const response = this._response.success(200, 'Update evaluation success')

    return res.status(response.statsCode || 200).json(response)
  }

  async getEvaluationDetail (req, res) {
    const token = req.headers.authorization
    const { evaluationId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateGetEvaluationDetail({ evaluationId })

    // Evaluation detail
    const evaluation = await this._evaluationService.getEvaluationDetail(evaluationId)

    // Response
    const response = this._response.success(200, 'Get evaluation detail success', evaluation)

    return res.status(response.statsCode || 200).json(response)
  }

  async deleteEvaluation (req, res) {
    const token = req.headers.authorization
    const { evaluationId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateGetEvaluationDetail({ evaluationId })

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to delete evaluation', 401)

    // Delete evaluation
    await this._evaluationService.deleteEvaluation(evaluationId)

    // Response
    const response = this._response.success(200, 'Delete evaluation success')

    return res.status(response.statsCode || 200).json(response)
  }

  // ESubmission
  async createESubmission (req, res) {
    const token = req.headers.authorization
    const payload = req.body
    const { evaluationId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    payload.evaluationId = evaluationId
    payload.studentId = _id
    this._validator.validateSubmitEvaluation(payload)

    // Make sure user is STUDENT
    if (user.role !== 'STUDENT') throw new ClientError('Unauthorized to create submission', 401)

    // Create submission
    const submission = await this._eSubmissionService.createSubmission(payload)

    // Response
    const response = this._response.success(200, 'Create submission success', submission)

    return res.status(response.statsCode || 200).json(response)
  }

  async checkESubmission (req, res) {
    const token = req.headers.authorization
    const { evaluationId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateGetEvaluationDetail({ evaluationId })

    // Make sure user is STUDENT
    if (user.role !== 'STUDENT') throw new ClientError('Unauthorized to check submission', 401)

    // Check submission
    const submission = await this._eSubmissionService.checkSubmission(evaluationId, _id)

    // Response
    const response = this._response.success(200, 'Check submission success', { isSubmitted: !!submission })

    return res.status(response.statsCode || 200).json(response)
  }
}

module.exports = {
  EvaluationController
}
