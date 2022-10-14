const { User } = require('../models')
// const { ClientError } = require('../errors')

class UserService {
  constructor () {
    this.name = 'userService'
    this.findUserByEmail = this.findUserByEmail.bind(this)
    this.findUserById = this.findUserById.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
  }

  async findUserByEmail (email) {
    return await User.findOne({ email: email.toLowerCase() })
  }

  async findUserById (id) {
    return await User.findOne({ id })
  }

  async createUser (user) {
    return await User.create(user)
  }

  async updatePassword (email, password) {
    return await User.findOneAndUpdate({ email }, { password })
  }
}

module.exports = {
  UserService
}
