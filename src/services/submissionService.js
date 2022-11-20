const { tSubmission } = require('../models')
const { ClientError } = require('../errors')
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

  async getSubmissionDetail (taskId, studentId) {
    const submission = await tSubmission.findOne({ taskId, studentId })
      .populate([
        { path: 'studentId', select: '_id fullName' },
        { path: 'attachments', select: '_id name type url' }
      ])
      .select('_id studentId answers attachments points reaction feedback createdAt updatedAt')
      .exec()

    if (!submission) throw new ClientError('No submission found', 404)

    return submission
  }
}

module.exports = {
  SubmissionService
}
