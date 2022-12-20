const { Question } = require('../models')
const { ClientError } = require('../errors')

class QuestionService {
  constructor () {
    this.name = 'QuestionService'
  }

  async createQuestion (payload) {
    return await Question.create(payload)
  }

  async updateQuestion (_id, payload) {
    const willUpdatedQuestion = await Question.findByIdAndUpdate(_id, payload, { new: true })

    if (!willUpdatedQuestion) throw new ClientError('Question not found', 404)

    return willUpdatedQuestion
  }

  async deleteQuestion (_id) {
    const willDeletedQuestion = await Question.findByIdAndDelete(_id)

    if (!willDeletedQuestion) throw new ClientError('Question not found', 404)

    return willDeletedQuestion
  }

  async getQuestionById (_id) {
    return await Question.findById(_id)
  }
}

module.exports = {
  QuestionService
}
