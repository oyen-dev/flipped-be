const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const taskSchema = new Schema({
  _id: { type: String, default: () => { return `tas-${nanoid(15)}` } },
  postId: { type: Schema.Types.String, ref: 'posts', default: null },
  deadline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  submissions: [{ type: Schema.Types.String, ref: 'tsubmissions' }],
  createdAt: { type: Date, default: () => { return new Date() } },
  updatedAt: { type: Date, default: () => { return new Date() } }
})

// Create model
const Task = model('tasks', taskSchema)

module.exports = {
  Task,
  taskSchema
}
