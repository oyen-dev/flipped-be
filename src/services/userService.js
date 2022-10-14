const { User } = require('../models')
// const { ClientError } = require('../errors')

class UserService {
  constructor () {
    this.name = 'userService'
    this.findUserByEmail = this.findUserByEmail.bind(this)
    this.findUserById = this.findUserById.bind(this)
    this.createUser = this.createUser.bind(this)
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
}

module.exports = {
  UserService
}
