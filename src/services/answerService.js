const { Answer } = require('../models')
// const { ClientError } = require('../errors')

class AnswerService {
  constructor () {
    this.name = 'AnswerService'
  }

  async createAnswer (payload) {
    return await Answer.create(payload)
  }

  async updateAnswer (_id, payload) {
    return await Answer.findByIdAndUpdate(_id, payload, { new: true })
  }
}

module.exports = {
  AnswerService
}
