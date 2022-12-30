const { model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)
const { MySchema } = require('../utils/dbExtensions')

const presenceSchema = new MySchema({
  _id: { type: String, default: () => { return `pre-${nanoid(15)}` } },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  studentPresences: {
    type: [{ type: MySchema.Types.String, ref: 'studentPresences' }],
    required: true,
    default: []
  }
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
