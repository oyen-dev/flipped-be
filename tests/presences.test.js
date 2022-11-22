const request = require('supertest')
const { app } = require('../src')
const { ClassService, GradeService, UserService } = require('../src/services')
const db = require('./database')

describe('Presence Route', () => {
  const sampleClassData = {
    teachers: ['NEED INJECTION'],
    schedule: {
      start: new Date('2020-02-10 08:00:00'),
      end: new Date('2020-02-10 11:00:00')
    },
    name: 'Kimia',
    gradeId: 'NEED INJECTION'
  }
  const sampleTeacherData = {
    email: 'teacher@example.com',
    fullName: 'Example Teacher',
    gender: true,
    dateOfBirth: '2002-02_16',
    placeOfBirth: 'Medan',
    address: 'Jl. Sudirman Kelurahan Butuh Kec. Pakisaji Kota Magelang'
  }

  let sampleClass

  let classService
  let gradeService
  let userService

  const createSampleClass = async () => {
    const grade = await gradeService.addGrade('11')
    const teacher = await userService.directCreateUser(sampleTeacherData, 'TEACHER')
    const classData = {
      ...sampleClassData,
      gradeId: grade._id,
      teachers: [teacher._id]
    }
    return await classService.addClass(classData)
  }

  beforeAll(async () => {
    classService = new ClassService()
    gradeService = new GradeService()
    userService = new UserService()
    await db.connectDatabase()
  })
  beforeEach(async () => {
    sampleClass = await createSampleClass()
  })
  afterEach(async () => await db.clearDatabase())
  afterAll(async () => await db.disconnectDatabase())

  describe('GET /', () => {
    it('returns status code 401 error when no user authenticated', async () => {
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences`)

      expect(res.statusCode).toEqual(401)
    })
  })
})
