const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const attachmentSchema = new Schema({
  _id: { type: String, default: () => { return `att-${nanoid(15)}` } },
  postId: { type: Schema.Types.String, ref: 'posts' },
  type: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Attachment = model('attachments', attachmentSchema)

module.exports = {
  Attachment,
  attachmentSchema
}
