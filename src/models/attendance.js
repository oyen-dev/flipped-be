const { model, Schema } = require('mongoose')
const { nanoid } = require('nanoid')

const attendanceSchema = new Schema({
  _id: { type: String, default: () => { return `att-${nanoid(15)}` } },
  presenceId: { type: Schema.Types.String, ref: 'presences' },
  studentId: { type: Schema.Types.String, ref: 'users' },
  at: { type: Date, required: true },
  status: { type: String, required: true }
})

// Create model
const Attendance = model('attendances', attendanceSchema)

module.exports = {
  Attendance,
  attendanceSchema
}
