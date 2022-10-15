const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const evaluationSchema = new Schema({
  _id: { type: String, default: () => { return `evl-${nanoid(15)}` } },
  classId: { type: Schema.Types.String, ref: 'classes' },
  teacherId: { type: Schema.Types.String, ref: 'users' },
  title: { type: String, required: true },
  questions: [{ type: Schema.Types.String, ref: 'questions' }],
  deadline: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  submissions: [{ type: Schema.Types.String, ref: 'esubmissions' }],
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Evaluation = model('evaluations', evaluationSchema)

module.exports = {
  Evaluation,
  evaluationSchema
}
