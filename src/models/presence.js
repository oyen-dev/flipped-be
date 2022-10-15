const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const presenceSchema = new Schema({
  _id: { type: String, default: `prc-${nanoid(15)}` },
  classId: { type: Schema.Types.String, ref: 'classes' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  attendance: [{
    studentId: { type: Schema.Types.String, ref: 'users' },
    at: { type: Date, required: true },
    status: { type: String, required: true }
  }],
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const Presence = model('presences', presenceSchema)

module.exports = {
  Presence,
  presenceSchema
}
