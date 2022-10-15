const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const gradeSchema = new Schema({
  _id: { type: String, default: `grd-${nanoid(15)}` },
  name: { type: String, required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Grade = model('grades', gradeSchema)

module.exports = {
  Grade,
  gradeSchema
}
