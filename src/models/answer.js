const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const answerSchema = new Schema({
  _id: { type: String, default: `ans-${nanoid(15)}` },
  questionId: { type: Schema.Types.String, ref: 'questions' },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Answer = model('answers', answerSchema)

module.exports = {
  Answer,
  answerSchema
}
