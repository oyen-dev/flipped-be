class Websocket {
  constructor (io, socketController) {
    this.name = 'Websocket'
    this._io = io
    this._socketController = socketController

    this._io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Handle online user
      socket.on('req_onlineUser', async (payload) => {
        console.log('Someone is online')
        await this._socketController.onlineUser(payload, socket)
      })

      // Handle offline user
      socket.on('req_offlineUser', async () => {
        console.log('Someone is offline')
        await this._socketController.offlineUser(socket)
      })

      socket.on('disconnect', async () => {
        console.log('user disconnected')
        await this._socketController.offlineUser(socket)
      })
    })
  }
}

module.exports = {
  Websocket
}
