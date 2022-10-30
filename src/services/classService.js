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
    let { q, tId, sId, archived, deleted, page, limit } = query

    if (q === '' || q === undefined) q = ''
    if (tId === '' || tId === undefined) tId = ''
    if (sId === '' || sId === undefined) sId = ''

    if (archived === '' || archived === undefined) archived = false
    else if (archived === 'true') archived = true
    else archived = false

    if (deleted === '' || deleted === undefined) deleted = false
    else if (deleted === 'true') deleted = true
    else deleted = false

    // Get class based on q tId sId page and limit
    const classes = await Class.find({
      isDeleted: deleted,
      isArchived: archived,
      name: { $regex: q, $options: 'i' },
      teachers: tId === '' ? { $exists: true } : { $in: [tId] },
      students: sId === '' ? { $exists: true } : { $in: [sId] }
    }).skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 })
      .populate({ path: 'teachers', select: '_id fullName' })
      .populate({ path: 'gradeId', select: '_id name' })
      .select('_id name teachers gradeId schedule')
      .exec()

    // Get total class based on q tId sId
    const count = await Class.countDocuments({
      isDeleted: deleted,
      isArchived: archived,
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

  async findClassById (id) {
    return await Class.findOne({ _id: id })
  }

  async archiveClass (id, archive) {
    // Check classId is exist
    const classData = await this.findClassById(id)
    if (!classData) throw new ClientError('Class not found', 404)

    // Edit class archive
    classData.isArchived = archive
    classData.updatedAt = new Date()

    await classData.save()
  }

  async deleteClass (id, deleted) {
    const oldClass = await this.findClassById(id)
    if (!oldClass) throw new ClientError('Class not found', 404)

    // Soft delete class
    oldClass.isDeleted = deleted

    if (deleted) {
      oldClass.isArchived = true
      oldClass.deletedAt = new Date()
      oldClass.willBeDeletedAt = new Date(new Date().setDate(new Date().getDate() + 90))
    } else {
      oldClass.isArchived = false
      oldClass.deletedAt = null
      oldClass.willBeDeletedAt = null
    }

    oldClass.updatedAt = new Date()

    return await oldClass.save()
  }
}

module.exports = {
  ClassService
}
