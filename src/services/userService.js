const { User } = require('../models')
// const { ClientError } = require('../errors')

class UserService {
  constructor () {
    this.name = 'userService'
    this.findUserByEmail = this.findUserByEmail.bind(this)
    this.findUserById = this.findUserById.bind(this)
  }

  async findUserByEmail (email) {
    return await User.findOne({ email: email.toLowerCase() })
  }

  async findUserById (id) {
    return await User.findOne({ id })
  }
}

module.exports = {
  UserService
}
