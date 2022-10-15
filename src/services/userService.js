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
      fullName,
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

  async updateUserProfile (id, user, type) {
    const { email, fullName, gender, dateOfBirth, placeOfBirth, address, phone } = user

    // Make sure email is not taken
    let updatedUser = await this.findUserByEmail(email)
    if (updatedUser) throw new ClientError('Sorry, this email is already taken.', 400)

    updatedUser = await this.findUserById(id)
    if (!updatedUser) throw new ClientError(`${type} not found.`, 404)

    updatedUser.email = email.toLowerCase()
    updatedUser.fullName = fullName
    updatedUser.gender = gender
    updatedUser.dateOfBirth = new Date(dateOfBirth)
    updatedUser.placeOfBirth = placeOfBirth
    updatedUser.address = address
    updatedUser.phone = phone
    updatedUser.updatedAt = new Date()

    return await updatedUser.save()
  }

  async deleteUser (id, type) {
    const oldUser = await this.findUserById(id)
    if (!oldUser) throw new ClientError(`${type} not found`, 404)

    // Soft delete
    oldUser.isDeleted = true
    oldUser.deletedAt = new Date()
    oldUser.willBeDeletedAt = new Date(new Date().setDate(new Date().getDate() + 30))
    oldUser.updatedAt = new Date()

    return await oldUser.save()
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
    }).select('_id email fullName gender dateOfBirth placeOfBirth role address phone picture')
    if (!user) throw new ClientError('User not found', 404)

    return user
  }
}

module.exports = {
  UserService
}
