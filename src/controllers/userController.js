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
  }

  async addTeacher (req, res) {
    const payload = req.body
    const { email } = payload

    try {
      // Validate payload
      this._validator.validateAddTeacher(payload)

      // Check if email was registered
      let user = await this._userService.findUserByEmail(email)
      if (user) throw new ClientError('Sorry, this email was registered.', 400)

      // Create new teacher
      user = await this._userService.createTeacher(payload)

      // Send email for change password

      // Send response
      const response = this._response.success(201, 'Add teacher success, please check your email to change password!')

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
      this._validator.validateEditTeacher({ id, ...payload })

      // Update teacher
      await this._userService.updateTeacher(id, payload)

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
      this._validator.validateDeleteTeacher({ id })

      // Delete teacher
      await this._userService.deleteTeacher(id)

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

      // Send response
      const response = this._response.success(200, 'Get teacher success!', user)

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
