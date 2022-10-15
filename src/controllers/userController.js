const { ClientError } = require('../errors')

class UserController {
  constructor (userService, mailService, validator, hashPassword, tokenize, response) {
    this.name = 'userController'
    this._userService = userService
    this._mailService = mailService
    this._validator = validator
    this._hashPassword = hashPassword
    this._tokenize = tokenize
    this._response = response

    this.addTeacher = this.addTeacher.bind(this)
    this.editTeacher = this.editTeacher.bind(this)
    this.deleteTeacher = this.deleteTeacher.bind(this)
    this.getTeachers = this.getTeachers.bind(this)
    this.getTeacher = this.getTeacher.bind(this)

    this.addStudent = this.addStudent.bind(this)
    this.editStudent = this.editStudent.bind(this)
    this.deleteStudent = this.deleteStudent.bind(this)
    this.getStudents = this.getStudents.bind(this)
    this.getStudent = this.getStudent.bind(this)
  }

  async addTeacher (req, res) {
    const payload = req.body
    const { email } = payload

    try {
      // Validate payload
      this._validator.validateAddUser(payload)

      // Check if email was registered
      let user = await this._userService.findUserByEmail(email)
      if (user) throw new ClientError('Sorry, this email was registered.', 400)

      // Create new teacher
      user = await this._userService.directCreateUser(payload, 'TEACHER')

      // Send email for change password

      // Send response
      const response = this._response.success(201, 'Add teacher success, please check email to set password!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async editTeacher (req, res) {
    const id = req.params.id
    const payload = req.body

    try {
      // Validate payload
      this._validator.validateEditUser({ id, ...payload })

      // Update teacher
      await this._userService.updateUserProfile(id, payload, 'Teacher')

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Edit teacher success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async deleteTeacher (req, res) {
    const id = req.params.id

    try {
      // Validate payload
      this._validator.validateDeleteUser({ id })

      // Delete teacher
      await this._userService.deleteUser(id, 'Teacher')

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Delete teacher success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getTeachers (req, res) {
    const payload = req.query
    const { q, page, limit } = payload

    try {
      // Validate payload
      this._validator.validateGetUsers(payload)

      // Get teachers
      const teachers = await this._userService.getUsers('TEACHER', q, page, limit)
      const { users, count } = teachers
      const meta = {
        count,
        limit,
        page,
        totalPages: Math.ceil(count / limit)
      }

      // Send response
      const response = this._response.success(200, 'Get teachers success!', users, meta)

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getTeacher (req, res) {
    const id = req.params.id

    try {
      // Validate payload
      this._validator.validateGetUser({ id })

      // Get teacher
      const user = await this._userService.getUser('TEACHER', id)

      // To do get enrolled class list

      // Send response
      const response = this._response.success(200, 'Get teacher success!', user)

      return res.status(200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async addStudent (req, res) {
    const payload = req.body
    const { email } = payload

    try {
      // Validate payload
      this._validator.validateAddUser(payload)

      // Check if email was registered
      let user = await this._userService.findUserByEmail(email)
      if (user) throw new ClientError('Sorry, this email was registered.', 400)

      // Create new teacher
      user = await this._userService.directCreateUser(payload, 'STUDENT')

      // Send email for change password

      // Send response
      const response = this._response.success(201, 'Add student success, please check email to set password!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async editStudent (req, res) {
    const id = req.params.id
    const payload = req.body

    try {
      // Validate payload
      this._validator.validateEditUser({ id, ...payload })

      // Update teacher
      await this._userService.updateUserProfile(id, payload, 'Student')

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Edit student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async deleteStudent (req, res) {
    const id = req.params.id

    try {
      // Validate payload
      this._validator.validateDeleteUser({ id })

      // Delete teacher
      await this._userService.deleteUser(id, 'Student')

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Delete student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getStudents (req, res) {
    const payload = req.query
    const { q, page, limit } = payload

    try {
      // Validate payload
      this._validator.validateGetUsers(payload)

      // Get teachers
      const students = await this._userService.getUsers('STUDENT', q, page, limit)
      const { users, count } = students
      const meta = {
        count,
        limit,
        page,
        totalPages: Math.ceil(count / limit)
      }

      // Send response
      const response = this._response.success(200, 'Get students success!', users, meta)

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getStudent (req, res) {
    const id = req.params.id

    try {
      // Validate payload
      this._validator.validateGetUser({ id })

      // Get teacher
      const user = await this._userService.getUser('STUDENT', id)

      // To do get enrolled class list

      // Send response
      const response = this._response.success(200, 'Get student success!', user)

      return res.status(200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  UserController
}
