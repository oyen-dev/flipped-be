const { Schema, model } = require('mongoose')
const { nanoid } = require('nanoid')

const classSchema = new Schema({
  _id: { type: String, default: `cls-${nanoid(15)}` },
  teachers: [{ type: Schema.Types.String, ref: 'users' }],
  schedule: [{ type: String, required: true }],
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
  // presence is an object with isOpen and presences array
  // isOpen is a boolean that indicates if the class is open for presence
  // presences is an array of objects with userId and presences array
  presence: {
    isOpen: { type: Boolean, default: false },
    presences: [{ type: Schema.Types.String, ref: 'presences' }]
  },
  createdAt: { type: String, default: new Date().toISOString() },
  updatedAt: { type: String, default: new Date().toISOString() }
})

// Create model
const Class = model('classes', classSchema)

module.exports = {
  Class,
  classSchema
}
