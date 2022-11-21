const { tSubmission } = require('../models')
// const { ClientError } = require('../errors')
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

  async getSubmissionByTaskAndStudentFull (taskId, studentId) {
    return await tSubmission.findOne({ taskId, studentId })
  }

  async getSubmissionDetail (taskId, studentId) {
    const submission = await tSubmission.findOne({ taskId, studentId })
      .populate([
        { path: 'studentId', select: '_id fullName' },
        { path: 'attachments', select: '_id name type url' }
      ])
      .select('_id studentId answers attachments points reaction feedback createdAt updatedAt')
      .exec()

    return submission
  }

  async getSubmissionsByTaskId (taskId) {
    return await tSubmission.find({ taskId })
      .select('_id studentId createdAt reaction points')
      .exec()
  }
}

module.exports = {
  SubmissionService
}
