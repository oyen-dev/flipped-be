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
}

module.exports = {
  TaskService
}
