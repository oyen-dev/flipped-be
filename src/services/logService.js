const { Log, User } = require('../models')

class LogService {
  constructor () {
    this.name = 'LogService'
  }

  async createLog (userId, action) {
    // Find user
    const user = await User.findById(userId)

    // Create log
    const log = await Log.create({ userId, action })

    // Insert to first user.logs
    user.logs.unshift(log._id)
    if (user.logs.length > 3) {
      user.logs.pop()
    }
    user.updatedAt = new Date()

    // Save user
    await user.save()
  }
}

module.exports = {
  LogService
}
