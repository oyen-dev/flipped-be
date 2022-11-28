const { faker } = require('@faker-js/faker')

/**
 * Generate a payload for registration
 * 
 * @returns {{email: String, fullName: String, gender: Boolean, dateOfBirth: String, placeOfBirth: String, address: String, password: String}} A generated payload
 */
function generateUserPayload() {
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

module.exports = {
  generateUserPayload
}