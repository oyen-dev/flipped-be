const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const tokenSchema = new Schema({
  _id: {
    type: String,
    default: () => { return `tkn-${nanoid(15)}` }
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  token: { type: String, required: true, unique: true },
  expiresIn: { type: Date, required: true }
})

// Auto delete token after 7 days
tokenSchema.index({ expiresIn: 1 }, { expireAfterSeconds: 604800 })

// Create model
const Token = model('tokens', tokenSchema)

module.exports = {
  Token,
  tokenSchema
}
