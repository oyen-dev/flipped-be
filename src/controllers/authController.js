const { ClientError } = require('../errors')
class AuthController {
  constructor (userService, validator, hashPassword, tokenize, response) {
    this.name = 'authController'
    this._userService = userService
    this._validator = validator
    this._hashPassword = hashPassword
    this._tokenize = tokenize
    this._response = response

    this.register = this.register.bind(this)
    this.login = this.login.bind(this)
  }

  async register (req, res) {
    const payload = req.body
    const { email, password } = payload

    try {
      // Validate payload
      this._validator.validateRegister(payload)

      // Check if user already exist
      let user = await this._userService.findUserByEmail(email)
      if (user) throw new ClientError('Sorry, this email was registered.', 400)

      // Hash password
      const hashedPassword = await this._hashPassword.hash(password)

      // Create user
      user = await this._userService.createUser({ ...payload, password: hashedPassword })

      // Send email

      // Response
      const response = this._response.success(201, 'Register success, please check your email to activate your account!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      return this._response.error(res, error)
    }
  }

  async login (req, res) {
    const payload = req.body
    const { email, password, remember } = payload

    try {
      // Validate payload
      this._validator.validateLogin(payload)

      // Find user
      const user = await this._userService.findUserByEmail(email)
      if (!user) throw new ClientError('You have entered an invalid username or password.', 400)

      // Check if account is actived
      if (!user.isActivated) throw new ClientError('Sorry, this account is not actived yet.', 400)

      // Check password
      const isValidPassword = await this._hashPassword.compare(password, user.password)
      if (!isValidPassword) throw new ClientError('You have entered an invalid username or password.', 400)

      // Generate token
      const accessToken = await this._tokenize.sign(user, remember)

      // Response
      const response = this._response.success(200, 'Login success!', { accessToken, expiredIn: remember ? '7d' : '1d' })

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  AuthController
}
