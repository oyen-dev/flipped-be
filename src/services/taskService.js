const { Task } = require('../models')

class TaskService {
  constructor () {
    this.name = 'TaskService'
  }

  async createTask (deadline, postId) {
    return await Task.create({ deadline, postId })
  }
}

module.exports = {
  TaskService
}
