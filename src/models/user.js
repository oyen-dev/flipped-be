const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const userSchema = new Schema({
  // Base user fileds
  _id: {
    type: String,
    default: `usr-${nanoid(15)}`
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  fullName: { type: String, required: true },
  gender: { type: Boolean, required: true },
  dateOfBirth: { type: String, required: true },
  placeOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  picture: { type: String, default: 'https://i.pravatar.cc/300' },
  phone: { type: String, default: '' },

  // Activation and soft delete
  isActivated: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: null },

  // Role
  role: { type: String, default: 'STUDENT' },

  // Timestamps
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const User = model('users', userSchema)

module.exports = {
  User,
  userSchema
}
