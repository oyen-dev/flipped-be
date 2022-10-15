const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const eSubmissionSchema = new Schema({
  _id: { type: String, default: `esb-${nanoid(15)}` },
  evaluationId: { type: Schema.Types.String, ref: 'evaluations' },
  studentId: { type: Schema.Types.String, ref: 'users' },
  answers: [{
    question: { type: String, required: true },
    choices: { type: String, required: true }
  }],
  points: { type: Number, default: 0 },
  reaction: { type: Number, default: 0 },
  submittedAt: { type: String, default: new Date().toISOString() },
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const eSubmission = model('esubmissions', eSubmissionSchema)

module.exports = {
  eSubmission,
  eSubmissionSchema
}
