const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const studentPresences = new Schema({
  _id: { type: String, default: () => { return `pre-${nanoid(15)}` } },
  studentId: { type: Schema.Types.String, ref: 'users' },
  at: { type: Date, required: true },
  reaction: { type: Number, default: 0 }
})

// Create model
const Presence = model('studentPresences', studentPresences)

module.exports = {
  Presence,
  studentPresences
}
