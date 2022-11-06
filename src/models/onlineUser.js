const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const onlineUserSchema = new Schema({
  _id: { type: String, default: () => { return `onl-${nanoid(15)}` } },
  userId: { type: String, required: true },
  socketId: { type: String, required: true }
})

// Create model
const OnlineUser = model('onlineUsers', onlineUserSchema)

module.exports = {
  OnlineUser,
  onlineUserSchema
}
