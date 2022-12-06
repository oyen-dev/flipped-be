const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const gradeSchema = new Schema({
  _id: { type: String, default: () => { return `gra-${nanoid(15)}` } },
  name: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
})

// add index text to name
gradeSchema.index({ name: 'text' })

// Create model
const Grade = model('grades', gradeSchema)

module.exports = {
  Grade,
  gradeSchema
}
