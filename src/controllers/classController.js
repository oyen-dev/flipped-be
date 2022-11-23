const { ClientError } = require('../errors')
const { bindAll } = require('../utils/classBinder')

class ClassController {
  constructor (classService, userService, gradeService, storageService, validator, tokenize, response) {
    this.name = 'ClassController'
    this._classService = classService
    this._userService = userService
    this._gradeService = gradeService
    this._storageService = storageService
    this._validator = validator
    this._tokenize = tokenize
    this._response = response

    bindAll(this)
  }

  async addClass (req, res) {
    const payload = req.body
    const token = req.headers.authorization

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Make sure user is ADMIN or TEACHER
    if (user.role !== 'ADMIN' && user.role !== 'TEACHER') throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateAddClass(payload)

    // Destructure payload
    const { name, teachers, schedule, grade } = payload

    // Make array of schedule
    const scheduleArray = schedule.map((item) => {
      return {
        start: new Date(item.start),
        end: new Date(item.end)
      }
    })

    // Remove duplicate teachers
    const uniqueTeachers = [...new Set(teachers)]

    // Validate teacherId inside teachers array
    for (let i = 0; i < uniqueTeachers.length; i++) {
      const teacher = await this._userService.findUserById(teachers[i])
      if (!teacher) throw new ClientError('Teacher not found', 404)
      if (teacher.role !== 'TEACHER') throw new ClientError('Teacher not found', 404)
    }

    // Verify grade is exist
    let gradeId = await this._gradeService.getGradeByName(grade)
    if (!gradeId) gradeId = await this._gradeService.addGrade(grade)

    // Add class
    const classObj = {
      teachers: [...uniqueTeachers],
      schedule: [...scheduleArray],
      name,
      gradeId: gradeId._id
    }
    const newClass = await this._classService.addClass(classObj)

    // Return response
    const data = {
      _id: newClass._id,
      name: newClass.name,
      invitationCode: newClass.invitationCode
    }
    const response = this._response.success(200, 'Add class success!', data)

    return res.status(response.statsCode || 200).json(response)
  }

  async getClasses (req, res) {
    const token = req.headers.authorization
    const query = req.query

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    await this._tokenize.verify(token)

    // Validate payload
    this._validator.validateGetClasses(query)

    // Get class
    const classData = await this._classService.getClasses(query)
    const { page, limit } = query
    const { classes, count } = classData
    const meta = {
      count,
      limit,
      page,
      totalPages: Math.ceil(count / limit)
    }

    // Response
    const response = this._response.success(200, 'Get class success!', classes, meta)

    return res.status(200).json(response)
  }

  async getClass (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    await this._tokenize.verify(token)

    // Validate payload
    this._validator.validateGetClass({ id })

    // Get class
    const classDetail = await this._classService.getClass(id)

    // Response
    const response = this._response.success(200, 'Get class success!', classDetail)

    return res.status(response.statsCode || 200).json(response)
  }

  async archiveClass (req, res) {
    const token = req.headers.authorization
    const payload = req.body

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Make sure user is ADMIN or TEACHER
    if (user.role !== 'ADMIN' && user.role !== 'TEACHER') throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateArchiveClass(payload)

    // Destructure payload
    const { id, archive } = payload

    // Archive class
    await this._classService.archiveClass(id, archive)

    // Response
    const response = this._response.success(200, `${archive ? 'Archive' : 'Restore'} class success!`)

    return res.status(response.statsCode || 200).json(response)
  }

  async deleteClass (req, res) {
    const token = req.headers.authorization
    const payload = req.body

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Make sure user is ADMIN or TEACHER
    if (user.role !== 'ADMIN' && user.role !== 'TEACHER') throw new ClientError('Unauthorized', 401)

    // Validate payload
    this._validator.validateDeleteClass(payload)

    // Destructure payload
    const { id, deleted } = payload

    // Delete class
    await this._classService.deleteClass(id, deleted)

    // Response
    const response = this._response.success(200, `${deleted ? 'Delete' : 'Restore'} class success!`)

    return res.status(response.statsCode || 200).json(response)
  }
}

module.exports = {
  ClassController
}
