const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const taskSchema = new Schema({
  _id: { type: String, default: `tsk-${nanoid(15)}` },
  classId: { type: Schema.Types.String, ref: 'classes' },
  deadline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  submissions: [{ type: Schema.Types.String, ref: 'tsubmissions' }],
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const Task = model('tasks', taskSchema)

module.exports = {
  Task,
  taskSchema
}
