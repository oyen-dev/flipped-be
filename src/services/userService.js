const { User } = require('../models')
const { ClientError } = require('../errors')

class UserService {
  constructor () {
    this.name = 'userService'
    this.findUserByEmail = this.findUserByEmail.bind(this)
    this.findUserById = this.findUserById.bind(this)
    this.createUser = this.createUser.bind(this)
    this.updatePassword = this.updatePassword.bind(this)
    this.createTeacher = this.createTeacher.bind(this)
    this.updateTeacher = this.updateTeacher.bind(this)
  }

  async findUserByEmail (email) {
    return await User.findOne({ email: email.toLowerCase() })
  }

  async findUserById (id) {
    return await User.findOne({ _id: id })
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

  async updateTeacher (id, user) {
    const teacher = await this.findUserById(id)
    if (!teacher) throw new ClientError('Teacher not found', 404)

    const { email, fullName, gender, dateOfBirth, placeOfBirth, address, phone } = user
    teacher.email = email.toLowerCase()
    teacher.fullName = fullName
    teacher.gender = gender
    teacher.dateOfBirth = new Date(dateOfBirth)
    teacher.placeOfBirth = placeOfBirth
    teacher.address = address
    teacher.phone = phone
    teacher.updatedAt = new Date()

    return await teacher.save()
  }
}

module.exports = {
  UserService
}
