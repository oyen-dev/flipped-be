const { Task } = require('../models')

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
}

module.exports = {
  TaskService
}
