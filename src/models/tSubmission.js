const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const tSubmissionSchema = new Schema({
  _id: { type: String, default: () => { return `tsb-${nanoid(15)}` } },
  taskId: { type: Schema.Types.String, ref: 'tasks' },
  studentId: { type: Schema.Types.String, ref: 'users' },
  answers: { type: String, default: null },
  attachments: [{ type: Schema.Types.String, ref: 'attachments' }],
  points: { type: Number, default: 0 },
  reaction: { type: Number, default: 0 },
  feedback: { type: String, default: null },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const tSubmission = model('tsubmissions', tSubmissionSchema)

module.exports = {
  tSubmission,
  tSubmissionSchema
}
