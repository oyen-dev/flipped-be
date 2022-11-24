const { ClientError } = require('../errors')
const { OnlineUser } = require('../models')

class OnlineUserService {
  constructor () {
    this.name = 'OnlineUserService'
  }

  async addOnlineUser (userId, socketId) {
    // Make sure there is no other online user with the same socketId
    const onlineUser = await OnlineUser.findOne({ socketId })
    if (onlineUser) {
      throw new ClientError('Online user already exists')
    }

    return await OnlineUser.create({ userId, socketId })
  }

  async removeOnlineUser (socketId) {
    return await OnlineUser.findOneAndDelete({ socketId })
  }
}

module.exports = {
  OnlineUserService
}
