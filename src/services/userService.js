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

  async directCreateUser (user, role) {
    const { email, fullName, gender, dateOfBirth, placeOfBirth, address } = user
    const newUser = new User({
      email: email.toLowerCase(),
      password: '12345678',
      fullName: this.toTitleCase(fullName),
      gender,
      dateOfBirth: new Date(dateOfBirth),
      placeOfBirth,
      address,
      isActivated: true,
      verifiedAt: new Date(),
      role
    })
    return await newUser.save()
  }

  async updateUserProfile (id, user) {
    const { fullName, gender, dateOfBirth, placeOfBirth, address, phone } = user

    const updatedUser = await this.findUserById(id)
    if (!updatedUser) throw new ClientError('User not found.', 404)

    updatedUser.fullName = fullName
    updatedUser.gender = gender
    updatedUser.dateOfBirth = new Date(dateOfBirth)
    updatedUser.placeOfBirth = placeOfBirth
    updatedUser.address = address
    updatedUser.phone = phone
    updatedUser.updatedAt = new Date()

    return await updatedUser.save()
  }

  async deleteUser (id) {
    const oldUser = await this.findUserById(id)
    if (!oldUser) throw new ClientError('User not found', 404)

    // Soft delete
    oldUser.isDeleted = true
    oldUser.deletedAt = new Date()
    oldUser.willBeDeletedAt = new Date(new Date().setDate(new Date().getDate() + 90))
    oldUser.updatedAt = new Date()

    return await oldUser.save()
  }

  async restoreUser (id) {
    const oldUser = await this.findUserById(id)
    if (!oldUser) throw new ClientError('User not found', 404)

    // Soft delete
    oldUser.isDeleted = false
    oldUser.deletedAt = null
    oldUser.willBeDeletedAt = null
    oldUser.updatedAt = new Date()

    return await oldUser.save()
  }

  async getUsers (type, q, page, limit, deleted) {
    if (q === '' || q === undefined) q = ''
    if (deleted === '' || deleted === 'false' || deleted === undefined) deleted = false
    else deleted = true

    // Get users based on q page and limit
    const users = await User.find({
      isDeleted: deleted,
      isActivated: true,
      role: type,
      fullName: { $regex: q, $options: 'i' }
    }).skip((page - 1) * limit)
      .limit(limit)
      .sort(deleted ? { willBeDeletedAt: 1 } : { fullName: 1 })
      // only return _id, fullName
      .select('_id fullName email isDeleted willBeDeletedAt')
      .exec()

    // Get total users
    const count = await User.countDocuments({
      isDeleted: deleted,
      isActivated: true,
      role: type,
      fullName: { $regex: q, $options: 'i' }
    })

    return {
      users,
      count
    }
  }

  async getUser (id) {
    const user = await User.findOne({
      _id: id,
      isDeleted: false,
      isActivated: true
    }).select('_id email fullName gender dateOfBirth placeOfBirth role address phone picture')
    if (!user) throw new ClientError('User not found', 404)

    return user
  }

  toTitleCase (phrase) {
    return phrase
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  async getLogs (userId) {
    const logs = await User.findOne({ _id: userId })
      .populate({ path: 'logs', select: '_id action at' })
      .select('logs')
      .exec()

    return logs
  }

  async getStatistic () {
    // Get total users with role "TEACHER" and isActivated = true and isDeleted = false
    const totalTeachers = await User.countDocuments({
      role: 'TEACHER',
      isActivated: true,
      isDeleted: false
    })

    // Get total users with role "STUDENT" and isActivated = true and isDeleted = false
    const totalStudents = await User.countDocuments({
      role: 'STUDENT',
      isActivated: true,
      isDeleted: false
    })

    // Count ratio of total teachers and total students
    const ratio = Math.ceil(totalStudents / totalTeachers)

    return {
      totalTeachers,
      totalStudents,
      ratio
    }
  }
}

module.exports = {
  UserService
}
