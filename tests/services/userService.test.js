const { User } = require("../../src/models")
const { UserService } = require("../../src/services/userService")
const { connectDatabase, clearDatabase, disconnectDatabase } = require("../database")
const { generateUserPayload } = require("../extensions/user")

describe('UserService', () => {
  let userService

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
    const validateUserData = (received, expected) => {
      expect(received.email).toEqual(expected.email)
      expect(received.fullName).toEqual(expected.fullName)
      expect(received.gender).toEqual(expected.gender)
      expect(received.dateOfBirth).toEqual(expected.dateOfBirth)
      expect(received.placeOfBirth).toEqual(expected.placeOfBirth)
      expect(received.address).toEqual(expected.address)
      expect(received._id).not.toBeNull()
    }

    it('returns a created user', async () => {
      const userPayload = generateUserPayload();
      const newUser = await userService.createUser(userPayload);

      validateUserData(userPayload, newUser)
    })

    it('save the created user data in database', async() => {
      const userPayload = generateUserPayload();
      const newUser = await userService.createUser(userPayload);
      const foundUser = await User.findById(newUser._id)

      validateUserData(userPayload, foundUser)
    })
  })
})