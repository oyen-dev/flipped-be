const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const logSchema = new Schema({
  _id: { type: String, default: `log-${nanoid(15)}` },
  userId: { type: Schema.Types.String, ref: 'users' },
  action: { type: String, required: true },
  createdAt: { type: String, default: new Date().toISOString() }
})

// Create model
const Log = model('logs', logSchema)

module.exports = {
  Log,
  logSchema
}
