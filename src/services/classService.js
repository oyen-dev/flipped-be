const { ClientError } = require('../errors')
const { Class } = require('../models/class')

class ClassService {
  constructor () {
    this.name = 'ClassService'
  }

  async addClass (payload) {
    return await Class.create(payload)
  }

  async getClasses (query) {
    // Destructure query
    let { q, tId, sId, page, limit } = query

    if (q === '' || q === undefined) q = ''
    if (tId === '' || tId === undefined) tId = ''
    if (sId === '' || sId === undefined) sId = ''

    // Get class based on q tId sId page and limit
    const classes = await Class.find({
      isDeleted: false,
      isArchived: false,
      name: { $regex: q, $options: 'i' },
      teachers: tId === '' ? { $exists: true } : { $in: [tId] },
      students: sId === '' ? { $exists: true } : { $in: [sId] }
    }).skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'teachers', select: '_id fullName' })
      .populate({ path: 'gradeId', select: '_id name' })
      .populate({ path: 'students', select: '_id fullName' })
      .select('_id name teachers gradeId schedule')
      .exec()

    // Get total class based on q tId sId
    const count = await Class.countDocuments({
      isDeleted: false,
      isArchived: false,
      name: { $regex: q, $options: 'i' },
      teachers: tId === '' ? { $exists: true } : { $in: [tId] },
      students: sId === '' ? { $exists: true } : { $in: [sId] }
    })

    return {
      classes,
      count
    }
  }

  async getClass (id) {
    const classDetail = await Class.findOne({
      _id: id,
      isDeleted: false,
      isArchived: false
    }).populate({ path: 'teachers', select: '_id fullName' })
      .populate({ path: 'students', select: '_id fullName' })
      .populate({ path: 'gradeId', select: '_id name' })
      .populate({
        path: 'posts',
        select: '_id title description teacherId attachments isTask taskId',
        populate: [
          { path: 'taskId', select: '_id deadline' },
          { path: 'teacherId', select: '_id fullName picture' },
          { path: 'attachments', select: '_id type url' }
        ]
      })
      .populate({ path: 'evaluations', select: '_id name' })
      .populate({ path: 'presences', select: '_id start end attendance' })
      .select('_id teachers schedule name gradeId cover students invitationCode posts evaluations presence presences')
      .exec({
        path: 'presence.presences',
        select: '_id name'
      })

    if (!classDetail) throw new ClientError('Class not found', 404)
    return classDetail
  }
}

module.exports = {
  ClassService
}
