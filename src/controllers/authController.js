const { ClientError } = require('../errors')
const { bindAll } = require('../utils/classBinder')
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

    bindAll(this)
  }

  async register (req, res) {
    const payload = req.body
    const { email, password } = payload

    // Validate payload
    this._validator.validateRegister(payload)

    // Check if user already exist
    let user = await this._userService.findUserByEmail(email)
    if (user) throw new ClientError('Sorry, this email was registered.', 400)

    // Hash password
    const hashedPassword = await this._hashPassword.hash(password)

    // Modify payload
    payload.password = hashedPassword
    payload.dateOfBirth = new Date(payload.dateOfBirth)

    // Create user
    user = await this._userService.createUser(payload)

    // Generate token
    const tokenDetails = await this._authService.createToken(user)
    const { token } = tokenDetails

    // Send email
    const url = process.env.CLIENT_URL || 'http://localhost:3000'
    const message = {
      name: user.fullName,
      email,
      link: `${url}/auth/verify?token=${token}`
    }
    await this._mailService.sendEmail(message, 'Hooray, Your Registration Success', 'register')

    // Response
    const response = this._response.success(201, 'Register success, please check your email to activate your account!')

    return res.status(response.statusCode || 200).json(response)
  }

  async login (req, res) {
    const payload = req.body
    const { email, password, remember } = payload

    // Validate payload
    this._validator.validateLogin(payload)

    // Find user
    const user = await this._userService.findUserByEmail(email)
    if (!user) throw new ClientError('You have entered an invalid username or password.', 400)

    // Check if account is actived
    if (!user.isActivated) throw new ClientError('Sorry, this account is not actived yet. Please check your email to activate.', 400)

    // Check if account is deleted
    if (user.isDeleted) throw new ClientError('Sorry, this account is deleted.', 400)

    // Check password
    const isValidPassword = await this._hashPassword.compare(password, user.password)
    if (!isValidPassword) throw new ClientError('You have entered an invalid username or password.', 400)

    // Generate token
    const accessToken = await this._tokenize.sign(user, remember)

    // Response
    const response = this._response.success(200, 'Login success!', { accessToken, expiredIn: remember ? '7d' : '1d' })

    return res.status(response.statusCode || 200).json(response)
  }

  async getAuthProfile (req, res) {
    const token = req.headers.authorization

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
  }

  async forgotPassword (req, res) {
    const payload = req.body
    const { email } = payload

    // Validate payload
    this._validator.validateForgotPassword(payload)

    // Find user
    const user = await this._userService.findUserByEmail(email)
    if (!user) throw new ClientError('Sorry, this email is not registered.', 400)

    // Check if account is deleted
    if (user.isDeleted) throw new ClientError('Sorry, this account is deleted.', 400)

    // Generate token
    const tokenDetails = await this._authService.createToken(user)
    const { token } = tokenDetails

    // Send email
    const url = process.env.CLIENT_URL || 'http://localhost:5173'
    const message = {
      name: user.fullName,
      email,
      link: `${url}/auth/reset-password?token=${token}`
    }
    await this._mailService.sendEmail(message, 'Request Reset Password', 'forgot')

    // Response
    const response = this._response.success(200, 'We have sent you an email to reset your password!')
    return res.status(response.statusCode || 200).json(response)
  }

  async resetPassword (req, res) {
    const token = req.query.token
    const payload = req.body
    const { password } = payload

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
    user.updatedAt = new Date().toISOString()
    await user.save()

    // Delete token
    await this._authService.deleteToken(email)

    // Response
    const response = this._response.success(200, 'Reset password success.')

    return res.status(response.statusCode || 200).json(response)
  }

  async checkToken (req, res) {
    const token = req.query.token

    // Check token is exist
    if (!token) throw new ClientError('Unauthorized', 401)

    // Validate token
    this._validator.validateCheckToken({ token })

    // Find token
    const tokenDetails = await this._authService.findTokenByToken(token)
    if (!tokenDetails) throw new ClientError('Invalid reset password token', 401)

    // Response
    const response = this._response.success(200, 'Token is valid.')

    return res.status(response.statusCode || 200).json(response)
  }

  async verifyAccount (req, res) {
    const payload = req.query
    const { token } = payload

    // Validate payload
    this._validator.validateCheckToken(payload)

    // Find token
    const tokenDetails = await this._authService.findTokenByToken(token)
    if (!tokenDetails) throw new ClientError('Invalid activation token', 401)

    // Get user based on token
    const { email } = tokenDetails
    const user = await this._userService.findUserByEmail(email)
    if (!user) throw new ClientError('Unauthorized', 401)

    // Activate user
    user.isActivated = true
    user.verifiedAt = new Date()
    user.updatedAt = new Date()
    await user.save()

    // Delete token
    await this._authService.deleteToken(email)

    // Response
    const response = this._response.success(200, 'Congratulations! Your account has been verified.')

    return res.status(response.statusCode || 200).json(response)
  }
}

module.exports = {
  AuthController
}
