const { Class } = require('../models/class')

class ClassService {
  constructor () {
    this.name = 'ClassService'
  }

  async addClass (payload) {
    return await Class.create(payload)
  }

  async getClass (query) {
    // Destructure query
    let { q, tId, sId, page, limit } = query

    if (q === '' || q === undefined) q = ''
    if (tId === '' || tId === undefined) tId = ''
    if (sId === '' || sId === undefined) sId = ''

    console.log('q', q)
    console.log('tId', tId)
    console.log('sId', sId)
    console.log('page', page)
    console.log('limit', limit)

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
}

module.exports = {
  ClassService
}
