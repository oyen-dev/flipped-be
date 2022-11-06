const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const logSchema = new Schema({
  _id: { type: String, default: () => { return `log-${nanoid(15)}` } },
  userId: { type: Schema.Types.String, ref: 'users' },
  action: { type: String, required: true },
  at: { type: Date, default: new Date() }
})

// Create model
const Log = model('logs', logSchema)

module.exports = {
  Log,
  logSchema
}
