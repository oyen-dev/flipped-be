const { ClientError } = require('../errors')
class AuthController {
  constructor (authService, userService, mailService, validator, hashPassword, tokenize, response) {
    this.name = 'authController'
    this._authService = authService
    this._userService = userService
    this._mailService = mailService
    this._validator = validator
    this._hashPassword = hashPassword
    this._tokenize = tokenize
    this._response = response

    this.register = this.register.bind(this)
    this.login = this.login.bind(this)
    this.getAuthProfile = this.getAuthProfile.bind(this)
    this.forgotPassword = this.forgotPassword.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
    this.checkToken = this.checkToken.bind(this)
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
      const message = {
        name: user.fullName,
        email,
        link: `https://wa.me/+6285736822725?text=Hallo%20mimin%20Flipped%20Learning..%0ASaya%20baru%20saja%20mendaftar%20LMS%20dengan%20nama%20lengkap%20${encodeURIComponent(user.fullName.trim())}%20dan%20email%20${user.email.replace(/@/g, '%40')}`
      }
      await this._mailService.sendEmail(message, 'Hooray, Your Registration Success1', 'register')

      // Response
      const response = this._response.success(201, 'Register success, please check your email to activate your account!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
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

  async getAuthProfile (req, res) {
    const token = req.headers.authorization
    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      const details = {
        _id: user._id,
        email: user.email,
        name: user.fullName,
        picture: user.picture,
        role: user.role
      }

      // Response
      const response = this._response.success(200, 'Get profile success!', details)

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      return this._response.error(res, error)
    }
  }

  async forgotPassword (req, res) {
    const payload = req.body
    const { email } = payload

    try {
      // Validate payload
      this._validator.validateForgotPassword(payload)

      // Find user
      const user = await this._userService.findUserByEmail(email)
      if (!user) throw new ClientError('Sorry, this email is not registered.', 400)

      // Generate token
      const tokenDetails = await this._authService.createToken(user)

      // Send email
      const message = {
        name: user.fullName,
        email: user.email,
        link: `https://lms.flippedlearning.id/reset-password?token=${tokenDetails.token}`
      }
      await this._mailService.sendEmail(message, 'Request Reset Password', 'forgot')

      // Response
      const response = this._response.success(200, 'We have sent you an email to reset your password!')
      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      return this._response.error(res, error)
    }
  }

  async resetPassword (req, res) {
    const token = req.query.token
    const payload = req.body
    const { password } = payload

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      this._validator.validateCheckToken({ token })

      // Validate payload
      this._validator.validateResetPassword(payload)

      // Find token
      const tokenDetails = await this._authService.findTokenByToken(token)
      if (!tokenDetails) throw new ClientError('Unauthorized', 401)

      // Get user based on token
      const { email } = tokenDetails
      const user = await this._userService.findUserByEmail(email)

      // Check if account is actived
      if (!user.isActivated) throw new ClientError('Sorry, this account is not actived yet.', 400)

      // Hash password
      const hashedPassword = await this._hashPassword.hash(password)

      // Update user
      user.password = hashedPassword
      await user.save()

      // Delete token
      await this._authService.deleteToken(email)

      // Response
      const response = this._response.success(200, 'Reset password success.')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      return this._response.error(res, error)
    }
  }

  async checkToken (req, res) {
    const token = req.query.token

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      this._validator.validateCheckToken({ token })

      // Find token
      const tokenDetails = await this._authService.findTokenByToken(token)
      if (!tokenDetails) throw new ClientError('Unauthorized', 401)

      // Response
      const response = this._response.success(200, 'Token is valid.')

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
