class SocketController {
  constructor (onlineUserService, logService) {
    this.name = 'SocketController'
    this._onlineUserService = onlineUserService
    this._logService = logService
  }

  async onlineUser (payload, socket) {
    const { userId } = payload
    const { id: socketId } = socket

    const onlineUser = await this._onlineUserService.addOnlineUser(userId, socketId)
    this._logService.createLog(userId, 'last online')

    // Return response
    socket.emit('res_onlineUser', { success: true, data: { onlineUser } })
  }

  async offlineUser (socket) {
    const { id: socketId } = socket

    await this._onlineUserService.removeOnlineUser(socketId)
  }
}

module.exports = {
  SocketController
}
