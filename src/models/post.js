const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const postSchema = new Schema({
  _id: { type: String, default: () => { return `pos-${nanoid(15)}` } },
  classId: { type: Schema.Types.String, ref: 'classes' },
  teacherId: { type: Schema.Types.String, ref: 'users' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [{ type: Schema.Types.String, ref: 'attachments' }],
  isTask: { type: Boolean, default: false },
  taskId: { type: Schema.Types.String, ref: 'tasks', default: null },
  createdAt: { type: Date, default: () => { return new Date() } },
  updatedAt: { type: Date, default: () => { return new Date() } }
})

// Create model
const Post = model('posts', postSchema)

module.exports = {
  Post,
  postSchema
}
