const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const eSubmissionSchema = new Schema({
  _id: { type: String, default: () => { return `esb-${nanoid(15)}` } },
  evaluationId: { type: Schema.Types.String, ref: 'evaluations' },
  studentId: { type: Schema.Types.String, ref: 'users' },
  answers: [{ type: Schema.Types.String, ref: 'answers' }],
  points: { type: Number, default: 0 },
  reaction: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const eSubmission = model('esubmissions', eSubmissionSchema)

module.exports = {
  eSubmission,
  eSubmissionSchema
}
