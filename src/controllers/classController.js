const { ClientError } = require('../errors')
const { bindAll } = require('../utils/classBinder')
const { deleteFile } = require('../services/localStorageService')

class ClassController {
  constructor (classService, presenceService, taskService, evaluationService, userService, gradeService, storageService, validator, tokenize, response) {
    this.name = 'ClassController'
    this._classService = classService
    this._presenceService = presenceService
    this._taskService = taskService
    this._evaluationService = evaluationService
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

  async updateClass (req, res) {
    const token = req.headers.authorization
    const id = req.params.id
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
    this._validator.validateUpdateClass(payload)

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

    // Update class
    const classObj = {
      teachers: [...uniqueTeachers],
      schedule: [...scheduleArray],
      name,
      gradeId: gradeId._id
    }
    const updatedClass = await this._classService.updateClass(id, classObj)

    // Return response
    const data = {
      _id: updatedClass._id,
      name: updatedClass.name,
      invitationCode: updatedClass.invitationCode
    }
    const response = this._response.success(200, 'Update class success!', data)

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

  async getClassTasks (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetClass({ id })

      // Get class
      const classDetail = await this._classService.getClassTasks(id)

      // Response
      const response = this._response.success(200, 'Get class tasks success!', classDetail)

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getClassStudents (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetClass({ id })

      // Get class student
      let { students } = await this._classService.getClassStudents(id)

      // Map students, only get 1 logs, other delete
      students = students.map((student) => {
        const { logs } = student
        const newLogs = logs.slice(0, 1)
        return {
          ...student._doc,
          logs: newLogs
        }
      })

      // Sort students by fullName
      students.sort((a, b) => {
        const nameA = a.fullName.toUpperCase()
        const nameB = b.fullName.toUpperCase()
        if (nameA < nameB) {
          return -1
        }
        if (nameA > nameB) {
          return 1
        }
        return 0
      })

      // Response
      const response = this._response.success(200, 'Get class students success!', { students })

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
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

  async joinClass (req, res) {
    const token = req.headers.authorization
    const payload = req.body

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Make sure user is ADMIN or TEACHER
      if (user.role !== 'STUDENT') throw new ClientError('Unauthorized to join class', 401)

      // Validate payload
      this._validator.validateJoinClass(payload)

      // Destructure payload
      const { invitation, join } = payload
      const { _id: userId } = user

      // Join class
      const classDetail = await this._classService.joinClass(userId, invitation, join)
      console.log(classDetail)

      // Response
      const response = this._response.success(200, `${join ? 'Join' : 'Leave'} class success!`, { _id: classDetail })

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getStudentReport (req, res) {
    const token = req.headers.authorization
    const { classId, studentId } = req.params

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Get all class presence
      const classroom = await this._classService.getClass(classId)
      const presences = await this._presenceService.getAllPresences(classroom)

      // Iterate presences and check if student is present
      const newPresences = []
      for (const presence of presences) {
        const isPresent = await this._presenceService.checkStudentIsPresent(presence._id, studentId)

        if (isPresent.studentPresences.length !== 0 && isPresent.studentPresences[0].attendance) {
          newPresences.push({ ...presence._doc, attendance: isPresent.studentPresences[0].attendance })
        } else {
          newPresences.push({ ...presence._doc, attendance: 0 })
        }
      }

      // Get all class tasks
      const { posts: tasks } = await this._classService.getClassTasks(classId)

      // Iterate tasks and check if student is done
      const newTasks = []
      for (const task of tasks) {
        const { title, points } = await this._taskService.getStudentPoint(task._id, studentId)
        newTasks.push({ title, points })
      }

      // Get all class evaluations
      const evaluations = await this._evaluationService.getClassEvaluations(classId)

      // Iterate evaluations and check if student is done
      const newEvaluations = []
      for (const evaluation of evaluations) {
        const points = await this._evaluationService.getStudentEvaluationPoint(evaluation._id, studentId)
        const evaluationDetail = {
          title: evaluation.title,
          points
        }
        newEvaluations.push(evaluationDetail)
      }

      // Response payload
      const payload = {
        presences: newPresences,
        tasks: newTasks,
        evaluations: newEvaluations
      }

      // Response
      const response = this._response.success(200, 'Get student report success!', payload)

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async updateClassCover (req, res) {
    const token = req.headers.authorization
    const file = req.files[0]
    const { classId } = req.params

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    const { _id } = await this._tokenize.verify(token)

    // Find user
    const user = await this._userService.findUserById(_id)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Check file is exists
    if (!file) throw new ClientError('Mohon lampirkan foto!', 400)

    // Find class
    const classData = await this._classService.findClassById(classId)

    // Check classData is exist
    if (!classData) throw new ClientError('Kelas tidak ditemukan!', 404)

    if (!file.mimetype.startsWith('image')) {
      deleteFile(file)
    }

    // Validate mime type and file size
    const { mimetype, size } = file
    this._validator.validateEditPicture({ mimetype, size })

    const fileName = `${process.env.BACKEND_URL}/storage/uploads/files${file.path.split('files')[1]}`

    // Update user profile picture
    classData.cover = fileName
    classData.updatedAt = new Date()
    await classData.save()

    // Send response
    const response = this._response.success(200, 'Pembaruan gambar kelas berhasil!')

    return res.status(response.statusCode || 200).json(response)
  }
}

module.exports = {
  ClassController
}
