const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const tokenSchema = new Schema({
  _id: {
    type: String,
    default: () => { return `tkn-${nanoid(15)}` }
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  token: { type: String, required: true, unique: true },
  expiresIn: { type: Date, required: true }
})

// Auto delete token after 1 day
tokenSchema.index({ expiresIn: 1 }, { expireAfterSeconds: 86400 })

// Create model
const Token = model('tokens', tokenSchema)

module.exports = {
  Token,
  tokenSchema
}
