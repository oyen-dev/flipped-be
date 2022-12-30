const { Schema, model } = require('mongoose')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 15)

const classSchema = new Schema({
  _id: { type: String, default: () => { return `cls-${nanoid(15)}` } },
  teachers: [{ type: Schema.Types.String, ref: 'users' }],
  schedule: [{ type: Object, required: true }],
  name: { type: String, required: true },
  gradeId: { type: Schema.Types.String, ref: 'grades' },
  cover: { type: String, default: null },
  students: [{ type: Schema.Types.String, ref: 'users' }],
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  willBeDeletedAt: { type: Date, default: null, index: { expires: '10s' } },
  invitationCode: { type: String, default: () => nanoid(5) },
  posts: [{ type: Schema.Types.String, ref: 'posts' }],
  evaluations: [{ type: Schema.Types.String, ref: 'evaluations' }],
  presences: [{ type: Schema.Types.String, ref: 'presences' }],
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Add index text to name
classSchema.index({ name: 'text' })

// Create model
const Class = model('classes', classSchema)

module.exports = {
  Class,
  classSchema
}
