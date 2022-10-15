const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const questionSchema = new Schema({
  _id: { type: String, default: `qst-${nanoid(15)}` },
  evaluationId: { type: Schema.Types.String, ref: 'evaluations' },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  key: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Question = model('questions', questionSchema)

module.exports = {
  Question,
  questionSchema
}
