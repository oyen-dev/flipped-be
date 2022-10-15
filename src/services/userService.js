const { User } = require('../models')
// const { ClientError } = require('../errors')

class UserService {
  constructor () {
    this.name = 'userService'
    this.findUserByEmail = this.findUserByEmail.bind(this)
    this.findUserById = this.findUserById.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.createTeacher = this.createTeacher.bind(this)
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

  async createTeacher (user) {
    const { email, fullName, gender, dateOfBirth, placeOfBirth, address } = user
    const newTeacher = new User({
      email: email.toLowerCase(),
      password: '12345678',
      fullName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      placeOfBirth,
      address,
      isActivated: true,
      verifiedAt: new Date(),
      role: 'TEACHER'
    })
    return await newTeacher.save()
  }
}

module.exports = {
  UserService
}
