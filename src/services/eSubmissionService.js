const { eSubmission } = require('../models')

class ESubmissionService {
  constructor () {
    this.name = 'ESubmissionService'
  }

  async createSubmission (payload) {
    return await eSubmission.create(payload)
  }

  async updateSubmission (_id, payload) {
    return await eSubmission.findByIdAndUpdate(_id, payload, { new: true })
  }
}

module.exports = {
  ESubmissionService
}
