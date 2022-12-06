const { faker } = require('@faker-js/faker')
const { UserService } = require('../../src/services/userService')

/**
 * Generate a payload for registration
 *
 * @returns {{email: String, fullName: String, gender: Boolean, dateOfBirth: String, placeOfBirth: String, address: String, password: String}} A generated payload
 */
function generateUserPayload () {
  const gender = !!Math.round(Math.random())
  return {
    email: faker.internet.email().toLowerCase(),
    fullName: faker.name.fullName(
      {
        sex: gender ? 'male' : 'female'
      }
    ),
    gender,
    dateOfBirth: faker.date.between(new Date('2000-01-01'), new Date('2005-12-31')).toISOString().split('T')[0],
    placeOfBirth: faker.address.cityName(),
    address: faker.address.streetAddress(true),
    password: 'password123'
  }
}

/**
 * Create a user in database
 *
 * @returns {{email: String, fullName: String, gender: Boolean, dateOfBirth: String, placeOfBirth: String, address: String, password: String}} User data
 */
async function createUser (payload) {
  if (!payload && typeof (payload) !== 'object') {
    payload = generateUserPayload()
  }
  return await new UserService().createUser(payload)
}

async function createTeacher () {
  const payload = {
    ...generateUserPayload(),
    role: 'TEACHER'
  }
  return await createUser(payload)
}

async function createStudent () {
  const payload = {
    ...generateUserPayload(),
    role: 'STUDENT'
  }
  return await createUser(payload)
}

async function createAdmin () {
  const payload = {
    ...generateUserPayload(),
    role: 'ADMIN'
  }
  return await createUser(payload)
}

module.exports = {
  generateUserPayload,
  createUser,
  createTeacher,
  createStudent,
  createAdmin
}
