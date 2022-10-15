const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const taskSchema = new Schema({
  _id: { type: String, default: `tsk-${nanoid(15)}` },
  postId: { type: Schema.Types.String, ref: 'posts' },
  deadline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  submissions: [{ type: Schema.Types.String, ref: 'tsubmissions' }],
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Task = model('tasks', taskSchema)

module.exports = {
  Task,
  taskSchema
}
