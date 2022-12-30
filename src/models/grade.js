const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const gradeSchema = new Schema({
  _id: { type: String, default: () => { return `gra-${nanoid(15)}` } },
  name: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// add index text to name
gradeSchema.index({ name: 'text' })

// Create model
const Grade = model('grades', gradeSchema)

module.exports = {
  Grade,
  gradeSchema
}
