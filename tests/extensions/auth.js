const { generateUserPayload } = require('./user')

function generateRegisterPayload() {
  const userPayload = generateUserPayload();
  return {
    ...userPayload,
    confirmPassword: userPayload.password
  }
}

module.exports = {
  generateRegisterPayload
}