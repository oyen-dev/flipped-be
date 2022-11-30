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

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateCreateQuestion(payload)

    // Make sure user is TEACHER
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to create question', 401)

    // Create question
    const question = await this._questionService.createQuestion(payload)

    // Response
    const response = this._response.success(200, 'Create question success', { _id: question._id })

    return res.status(response.statsCode || 200).json(response)
  }

  async updateQuestion (req, res) {
    const token = req.headers.authorization
    const { questionId } = req.params
    const payload = req.body

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

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
    if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to update question', 401)

    // Delete question
    await this._questionService.deleteQuestion(questionId)

    // Response
    const response = this._response.success(200, 'Delete question success')

    return res.status(response.statsCode || 200).json(response)
  }

  // Evaluation

  // Answer

  // ESubmission
}

module.exports = {
  EvaluationController
}
