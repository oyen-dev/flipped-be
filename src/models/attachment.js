const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const attachmentSchema = new Schema({
  _id: { type: String, default: () => { return `att-${nanoid(15)}` } },
  postId: { type: Schema.Types.String, ref: 'posts', default: null },
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: () => { return new Date() } },
  updatedAt: { type: Date, default: () => { return new Date() } }
})

// Create model
const Attachment = model('attachments', attachmentSchema)

module.exports = {
  Attachment,
  attachmentSchema
}
