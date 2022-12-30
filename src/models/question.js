const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const questionSchema = new Schema({
  _id: { type: String, default: () => { return `que-${nanoid(15)}` } },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  key: { type: Number, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Question = model('questions', questionSchema)

module.exports = {
  Question,
  questionSchema
}
