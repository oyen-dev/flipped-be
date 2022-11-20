const { tSubmission } = require('../models')

class SubmissionService {
  constructor () {
    this.name = 'SubmissionService'
  }

  async createSubmission (payload) {
    return await tSubmission.create(payload)
  }

  async updateSubmission (id, payload) {
    return await tSubmission.findByIdAndUpdate(id, payload, { new: true })
  }

  async deleteSubmission (id) {
    return await tSubmission.findByIdAndDelete(id)
  }

  async getSubmissionById (id) {
    return await tSubmission.findById(id)
  }

  async checkDuplicateSubmission (taskId, studentId) {
    return await tSubmission.findOne({ taskId, studentId })
  }

  async getSubmissionByTaskAndStudent (taskId, studentId) {
    const res = await tSubmission.findOne({ taskId, studentId })

    if (res) return true

    return false
  }
}

module.exports = {
  SubmissionService
}
