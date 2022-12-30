const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const userSchema = new Schema({
  // Base user fileds
  _id: {
    type: String,
    default: () => { return `usr-${nanoid(15)}` }
  },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  fullName: { type: String, required: true },
  gender: { type: Boolean, required: true },
  dateOfBirth: {
    type: Date,
    required: true,
    get: function (data) {
      return data.toISOString().split('T')[0]
    }
  },
  placeOfBirth: { type: String, required: true },
  address: { type: String, required: true },
  picture: { type: String, default: (user) => { return `https://ui-avatars.com/api/?name=${user.fullName.split(' ')[0]}&size=300` } },
  phone: { type: String, default: '' },

  // Activation and soft delete
  isActivated: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  willBeDeletedAt: { type: Date, default: null, index: { expires: '10s' } },

  // Role
  role: { type: String, default: 'STUDENT' },

  // Logs
  logs: [{ type: Schema.Types.String, ref: 'logs' }],

  // Timestamps
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Add index for better search in field fullName
userSchema.index({ fullName: 'text' })

// Create model
const User = model('users', userSchema)

module.exports = {
  User,
  userSchema
}
