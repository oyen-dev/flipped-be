const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const presenceSchema = new Schema({
  _id: { type: String, default: () => { return `pre-${nanoid(15)}` } },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  studenPresences: [{ type: Schema.Types.String, ref: 'studentPresences' }]
})

// Create model
const Presence = model('presences', presenceSchema)

module.exports = {
  Presence,
  presenceSchema
}
