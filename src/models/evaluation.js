const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const evaluationSchema = new Schema({
  _id: { type: String, default: `evl-${nanoid(15)}` },
  classId: { type: Schema.Types.String, ref: 'classes' },
  teacherId: { type: Schema.Types.String, ref: 'users' },
  title: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    choices: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true }
    },
    correctAnswer: { type: String, required: true }
  }],
  deadline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  submissions: [{ type: Schema.Types.String, ref: 'esubmissions' }],
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const Evaluation = model('evaluations', evaluationSchema)

module.exports = {
  Evaluation,
  evaluationSchema
}
