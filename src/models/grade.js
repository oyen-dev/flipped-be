const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const gradeSchema = new Schema({
  _id: { type: String, default: `grd-${nanoid(15)}` },
  name: { type: String, required: true },
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const Grade = model('grades', gradeSchema)

module.exports = {
  Grade,
  gradeSchema
}
