const { generateUserPayload, createStudent, createAdmin, createTeacher } = require('./user')
const { Tokenize } = require('../../src/utils/tokenize')

function generateRegisterPayload () {
  const userPayload = generateUserPayload()
  return {
    ...userPayload,
    confirmPassword: userPayload.password
  }
}

async function createToken (user) {
  return await new Tokenize().sign(user, false)
}

async function createStudentToken (student) {
  if (!student) {
    student = await createStudent()
  }
  return await createToken(student)
}

async function createTeacherToken (teacher) {
  if (!teacher) {
    teacher = await createTeacher()
  }
  return await createToken(teacher)
}

async function createAdminToken (admin) {
  if (!admin) {
    admin = await createAdmin()
  }
  return await createToken(admin)
}

module.exports = {
  generateRegisterPayload,
  createToken,
  createStudentToken,
  createTeacherToken,
  createAdminToken
}
