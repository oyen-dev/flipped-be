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
}

module.exports = {
  UserController
}
