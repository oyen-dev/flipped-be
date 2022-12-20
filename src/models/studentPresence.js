const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const studentPresence = new Schema({
  _id: { type: String, default: () => { return `supre-${nanoid(15)}` } },
  student: { type: Schema.Types.String, ref: 'users' },
  at: {
    type: Date,
    required: true,
    get: function (data) {
      return data.toISOString()
    }
  },
  reaction: { type: Number, default: 0 },
  attendance: { type: Number, required: true }
}, {
  versionKey: false
})

// Create model
const StudentPresence = model('studentPresences', studentPresence)

module.exports = {
  StudentPresence,
  studentPresence
}
