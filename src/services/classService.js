const { ClientError } = require('../errors')
const { Class, User } = require('../models')

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
      .populate({ path: 'students', select: '_id fullName' })
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
      // .populate({ path: 'students', select: '_id fullName' })
      .populate({ path: 'gradeId', select: '_id name' })
      // .populate({
      //   path: 'posts',
      //   select: '_id title description teacherId attachments isTask taskId',
      //   populate: [
      //     { path: 'taskId', select: '_id deadline' },
      //     { path: 'teacherId', select: '_id fullName picture' },
      //     { path: 'attachments', select: '_id type url' }
      //   ]
      // })
      // .populate({ path: 'evaluations', select: '_id name' })
      .populate({ path: 'presences', select: '_id start end attendance' })
      .select('_id teachers name gradeId cover invitationCode presence presences')
      .exec({
        path: 'presence.presences',
        select: '_id name'
      })

    if (!classDetail) throw new ClientError('Class not found', 404)
    return classDetail
  }

  async getClassPosts (id) {
    const classDetail = await Class.findOne({
      _id: id,
      isDeleted: false,
      isArchived: false
    }).populate({
      path: 'posts',
      select: '_id title description teacherId attachments isTask taskId createdAt updatedAt',
      populate: [
        { path: 'taskId', select: '_id deadline' },
        { path: 'teacherId', select: '_id fullName picture' },
        { path: 'attachments', select: '_id type url name' }
      ]
    }).select('_id posts')
      .exec()

    if (!classDetail) throw new ClientError('Class not found', 404)

    // Sort post by createdAt
    classDetail.posts.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return classDetail
  }

  async getClassTasks (id) {
    const classDetail = await Class.findOne({
      _id: id,
      isDeleted: false,
      isArchived: false
    }).populate({
      path: 'posts',
      // Get only posts that property isTask is true
      match: { isTask: true },
      select: '_id title description teacherId attachments isTask taskId createdAt updatedAt',
      populate: [
        { path: 'taskId', select: '_id deadline submissions' },
        { path: 'teacherId', select: '_id fullName picture' },
        { path: 'attachments', select: '_id type url name' }
      ]
    }).select('_id posts')
      .exec()

    if (!classDetail) throw new ClientError('Class not found', 404)

    // Sort post by createdAt
    classDetail.posts.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return classDetail
  }

  async getClassPost (classId, postId) {
    const posts = await Class.findOne({
      _id: classId,
      isDeleted: false,
      isArchived: false,
      // posts is array of postId, just get the postId
      posts: { $in: [postId] }
    }).populate({
      path: 'posts',
      select: '_id title description attachments isTask taskId',
      populate: [
        { path: 'attachments', select: '_id name type url' },
        { path: 'taskId', select: '_id deadline' }
      ]
    }).select('_id posts')
      .exec()

    if (!posts) throw new ClientError('Post not found', 404)

    // Get the post
    const index = posts.posts.findIndex(post => post._id === postId)
    const post = posts.posts[index]

    return post
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

  async joinClass (userId, invitation, join) {
    // Check invitation code is exist
    const classData = await Class.findOne({ invitationCode: invitation })
    if (!classData) throw new ClientError('Invalid invitation code', 404)

    // Check if class is archived or deleted
    if (classData.isArchived || classData.isDeleted) throw new ClientError('Unable to join class', 404)

    // Check user is exist
    const userData = await User.findOne({ _id: userId })
    if (!userData) throw new ClientError('User not found', 404)

    // Join or leave class
    if (join) {
      classData.students.push(userId)
    } else {
      classData.students.pull(userId)
    }
    classData.updatedAt = new Date()

    await classData.save()

    return classData._id
  }

  async getDashboardClass (userId, role) {
    let classes = []

    if (role === 'ADMIN') {
      // Select class based on isDeleted = false, isArchived = false, just only 3 first class
      classes = await Class.find({
        isDeleted: false,
        isArchived: false
      }).sort({ name: 1 })
        .populate({ path: 'teachers', select: '_id fullName' })
        .populate({ path: 'gradeId', select: '_id name' })
        .select('_id name teachers gradeId students')
        .limit(3)
        .exec()
    } else if (role === 'TEACHER') {
      // Select class based on teacherId, isDeleted = false, isArchived = false, just only 3 first class
      classes = await Class.find({
        teachers: { $in: [userId] },
        isDeleted: false,
        isArchived: false
      }).sort({ name: 1 })
        .populate({ path: 'teachers', select: '_id fullName' })
        .populate({ path: 'gradeId', select: '_id name' })
        .select('_id name teachers gradeId students')
        .limit(3)
        .exec()
    } else if (role === 'STUDENT') {
      // Select class based on studentId, isDeleted = false, isArchived = false, just only 3 first class
      classes = await Class.find({
        students: { $in: [userId] },
        isDeleted: false,
        isArchived: false
      }).sort({ name: 1 })
        .populate({ path: 'teachers', select: '_id fullName' })
        .populate({ path: 'gradeId', select: '_id name' })
        .select('_id name teachers gradeId students')
        .limit(3)
        .exec()
    }

    // Change class.students to total of students not array
    classes.forEach((item) => {
      item.students = parseInt(item.students.length)
    })

    return classes
  }

  async addPostToClass (classId, postId) {
    const classData = await this.findClassById(classId)
    if (!classData) throw new ClientError('Class not found', 404)

    classData.posts.push(postId)
    classData.updatedAt = new Date()

    await classData.save()
  }

  async getClassStudents (classId) {
    const students = await Class.findOne({
      _id: classId,
      isDeleted: false,
      isArchived: false
    })
      .populate({ path: 'students', select: '_id fullName picture logs', populate: { path: 'logs', select: '_id action at' } })
      .select('_id students')
      .exec()

    if (!students) throw new ClientError('Class not found', 404)

    return students
  }

  async removePostFromClass (classId, postId) {
    const classData = await this.findClassById(classId)
    if (!classData) throw new ClientError('Class not found', 404)

    classData.posts.pull(postId)
    classData.updatedAt = new Date()

    await classData.save()
  }
}

module.exports = {
  ClassService
}
