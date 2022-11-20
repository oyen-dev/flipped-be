const { Task } = require('../models')
const { ClientError } = require('../errors')

class TaskService {
  constructor () {
    this.name = 'TaskService'
  }

  async createTask (deadline, postId) {
    return await Task.create({ deadline, postId })
  }

  async updateTaskDeadline (_id, deadline) {
    return await Task.findByIdAndUpdate(_id, { deadline }, { new: true })
  }

  async deleteTask (_id) {
    return await Task.findByIdAndDelete(_id)

    // To do : delete all submissions
  }

  async getTaskById (_id) {
    return await Task.findById(_id)
  }

  async getTaskSubmissions (_id) {
    const submissions = await Task.findById(_id)
      .populate([
        {
          path: 'submissions',
          populate: [
            { path: 'studentId', select: '_id fullName' },
            { path: 'attachments', select: '_id name type url' }
          ],
          select: '_id studentId answers attachments points reaction feedback createdAt updatedAt'
        }
      ])
      .select('submissions')
      .exec()

    if (!submissions) throw new ClientError('No submissions found')

    return submissions
  }
}

module.exports = {
  TaskService
}
