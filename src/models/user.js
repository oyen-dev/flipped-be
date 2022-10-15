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
  verifiedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },

  // Role
  role: { type: String, default: 'STUDENT' },

  // Class
  // classEnrolled with array of class id
  classEnrolled: [{ type: Schema.Types.String, ref: 'classes' }],

  // Logs
  logs: [{ type: Schema.Types.String, ref: 'logs' }],

  // Timestamps
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const User = model('users', userSchema)

module.exports = {
  User,
  userSchema
}
