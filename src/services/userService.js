const { User } = require('../models')
const { ClientError } = require('../errors')

class UserService {
  constructor () {
    this.name = 'userService'
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

  async deleteTeacher (id) {
    const teacher = await this.findUserById(id)
    if (!teacher) throw new ClientError('Teacher not found', 404)

    // Soft delete
    teacher.isDeleted = true
    teacher.deletedAt = new Date()
    teacher.willBeDeletedAt = new Date(new Date().setDate(new Date().getDate() + 30))
    teacher.updatedAt = new Date()

    return await teacher.save()
  }

  async getUsers (type, q, page, limit) {
    if (q === '' || q === undefined) q = ''

    // Get users based on q page and limit
    const users = await User.find({
      isDeleted: false,
      isActivated: true,
      role: type,
      fullName: { $regex: q, $options: 'i' }
    }).skip((page - 1) * limit)
      .limit(limit)
      .sort({ fullName: 1 })
      // only return _id, fullName
      .select('_id fullName email')
      .exec()

    // Get total users
    const count = await User.countDocuments({
      isDeleted: false,
      isActivated: true,
      role: type,
      fullName: { $regex: q, $options: 'i' }
    })

    return {
      users,
      count
    }
  }

  async getUser (type, id) {
    const user = await User.findOne({
      _id: id,
      isDeleted: false,
      isActivated: true,
      role: type
    }).select('_id email fullName gender dateOfBirth placeOfBirth address phone picture')
    if (!user) throw new ClientError('User not found', 404)

    return user
  }
}

module.exports = {
  UserService
}
