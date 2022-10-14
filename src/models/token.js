const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const tokenSchema = new Schema({
  _id: {
    type: String,
    default: `tkn-${nanoid(15)}`
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  token: { type: String, required: true },
  expiresIn: { type: String, required: true }
})

// Create model
const Token = model('tokens', tokenSchema)

module.exports = {
  Token,
  tokenSchema
}
