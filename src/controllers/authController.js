class AuthController {
  constructor (userService) {
    this.name = 'authController'
    this.userService = userService
    this.register = this.register.bind(this)
  }

  async register (req, res) {
    const payload = req.body

    try {
      return res.status(200).json(payload)
    } catch (error) {
      return res.status(500).json(error)
    }
  }
}

module.exports = {
  AuthController
}
