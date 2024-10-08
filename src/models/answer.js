const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const answerSchema = new Schema({
  _id: { type: String, default: () => { return `ans-${nanoid(15)}` } },
  questionId: { type: Schema.Types.String, ref: 'questions' },
  answer: { type: Number, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Answer = model('answers', answerSchema)

module.exports = {
  Answer,
  answerSchema
}
