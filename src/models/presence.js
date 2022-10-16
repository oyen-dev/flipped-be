const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const presenceSchema = new Schema({
  _id: { type: String, default: () => { return `pre-${nanoid(15)}` } },
  classId: { type: Schema.Types.String, ref: 'classes' },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  attendance: [{ type: Schema.Types.String, ref: 'attendances' }],
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Presence = model('presences', presenceSchema)

module.exports = {
  Presence,
  presenceSchema
}
