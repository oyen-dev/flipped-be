const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const logSchema = new Schema({
  _id: { type: String, default: () => { return `log-${nanoid(15)}` } },
  userId: { type: Schema.Types.String, ref: 'users' },
  action: { type: String, required: true },
  at: { type: Date, default: () => { return new Date() } }
})

// Create model
const Log = model('logs', logSchema)

module.exports = {
  Log,
  logSchema
}
