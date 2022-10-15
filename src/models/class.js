const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const classSchema = new Schema({
  _id: { type: String, default: () => { return `cls-${nanoid(15)}` } },
  teachers: [{ type: Schema.Types.String, ref: 'users' }],
  schedule: [{ type: Date, required: true }],
  name: { type: String, required: true },
  gradeId: { type: Schema.Types.String, ref: 'grades' },
  cover: { type: String, default: '' },
  students: [{ type: Schema.Types.String, ref: 'users' }],
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  invitationCode: { type: String, default: () => nanoid(5) },
  posts: [{ type: Schema.Types.String, ref: 'posts' }],
  evaluations: [{ type: Schema.Types.String, ref: 'evaluations' }],
  presence: {
    isOpen: { type: Boolean, default: false },
    presences: [{ type: Schema.Types.String, ref: 'presences' }]
  },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() }
})

// Create model
const Class = model('classes', classSchema)

module.exports = {
  Class,
  classSchema
}
