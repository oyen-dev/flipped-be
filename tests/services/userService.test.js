const { User } = require('../../src/models')
const { UserService } = require('../../src/services/userService')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../extensions/database')
const { generateUserPayload, createUser } = require('../extensions/user')
const should = require('should')
const _ = require('lodash')

describe('UserService', () => {
  let userService

  const validateUserData = (received, expected, only) => {
    const properties = ['email', 'fullName', 'gender', 'dateOfBirth', 'placeOfBirth', 'address']
    let checkProperties

    if (only && Array.isArray(only)) {
      checkProperties = only
    } else {
      checkProperties = properties
    }

    for (const prop of checkProperties) {
      received[prop].should.be.equal(expected[prop])
    }
    expect(received._id).not.toBeNull()
  }

  beforeAll(async () => {
    await connectDatabase()

    userService = new UserService()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('createUser', () => {
    it('returns a created user', async () => {
      const userPayload = generateUserPayload()
      const newUser = await userService.createUser(userPayload)
      validateUserData(newUser, userPayload)
    })

    it('save the created user data in database', async () => {
      const userPayload = generateUserPayload()
      const newUser = await userService.createUser(userPayload)
      const foundUser = await User.findById(newUser._id)

      validateUserData(foundUser, userPayload)
    })
  })

  describe('directCreateUser', () => {
    it('returns a created user with valid role', async () => {
      const role = 'TEACHER'
      const userPayload = generateUserPayload()
      const newTeacher = await userService.directCreateUser(userPayload, role)

      validateUserData(userPayload, newTeacher)
      newTeacher.role.should.equal(role)
    })
  })

  describe('getUsers', () => {
    it('returns users array and count', async () => {
      const result = await userService.getUsers('STUDENT')
      result.users.should.be.Array()
      result.count.should.be.Number()
    })

    it('returns valid users data sorted by fullName and valid count', async () => {
      const userPayload = { ...generateUserPayload(), fullName: 'Bagus', isActivated: true }
      const anotherUserPayload = { ...generateUserPayload(), fullName: 'Adinda', isActivated: true }
      await userService.createUser(userPayload)
      await userService.createUser(anotherUserPayload)

      const result = await userService.getUsers('STUDENT')

      const checkProperties = ['fullName', 'email']
      result.users.should.be.length(2)
      validateUserData(result.users[0], anotherUserPayload, checkProperties)
      validateUserData(result.users[1], userPayload, checkProperties)

      result.count.should.be.equal(2)
    })
  })

  describe('findUserByEmail', () => {
    it('returns null when user having the email does not exist', async () => {
      const foundUser = await userService.findUserByEmail('no-email@example.com')
      expect(foundUser).toBeNull()
    })

    it('returns the user data when email exists in database', async () => {
      const user = await createUser()
      const foundUser = await userService.findUserByEmail(user.email)
      validateUserData(foundUser, user)
    })
  })
})
