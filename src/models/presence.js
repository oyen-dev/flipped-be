const { model } = require('mongoose')
const { nanoid } = require('nanoid')
const { MySchema } = require('../utils/dbExtensions')

const presenceSchema = new MySchema({
  _id: { type: String, default: () => { return `pre-${nanoid(15)}` } },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  studentPresences: { type: [{ type: MySchema.Types.ObjectId }], default: [] }
}, {
  versionKey: false,
  timestamps: true
})

presenceSchema.index({
  end: -1
})

// Create model
const Presence = model('presences', presenceSchema)

module.exports = {
  Presence,
  presenceSchema
}
