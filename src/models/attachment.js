const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const attachmentSchema = new Schema({
  _id: { type: String, default: () => { return `att-${nanoid(15)}` } },
  postId: { type: Schema.Types.String, ref: 'posts', default: null },
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
