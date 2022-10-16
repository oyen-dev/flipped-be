const { ClientError } = require('../errors')

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

    this.addClass = this.addClass.bind(this)
  }

  async addClass (req, res) {
    const payload = req.body
    const token = req.headers.authorization

    try {
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
      const { name, teachers, schedule, gradeId } = payload

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
      let grade = await this._gradeService.getGradeByName(gradeId)
      if (!grade) grade = await this._gradeService.addGrade(gradeId)

      // Add class
      const classObj = {
        teachers: [...uniqueTeachers],
        schedule: [...scheduleArray],
        name,
        gradeId: grade._id
      }
      let newClass = await this._classService.addClass(classObj)

      newClass = await this._classService.test(newClass._id)

      // Return response
      const response = this._response.success(200, 'Add class success!', newClass)

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  ClassController
}

//   schedule.forEach(sch => {
//     let scheduleDay = new Date(sch.start)
//       .toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })

//     console.log(scheduleDay)
//     scheduleDay = new Date(sch.end)
//       .toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })

//     console.log(scheduleDay)
//   })
