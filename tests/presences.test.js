const request = require('supertest')
const { app } = require('../src/app')
const { ClassService, GradeService, UserService } = require('../src/services')
const { Tokenize } = require('../src/utils')
const db = require('./database')
const { cleanStringify } = require('./extension')

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
const presenceData = {
  start: '2020-09-10 08:00:00',
  end: '2020-09-10 10:00:00'
}
const anotherPresenceData = {
  start: '2020-09-19 10:00:00',
  end: '2020-09-20 12:00:00'
}

const createSampleClass = async (gradeService, classService, userService) => {
  const grade = await gradeService.addGrade('11')
  const teacher = await userService.directCreateUser(sampleTeacherData, 'TEACHER')
  const classData = {
    ...sampleClassData,
    gradeId: grade._id,
    teachers: [teacher._id]
  }
  return await classService.addClass(classData)
}

describe('Presence Route', () => {
  const sampleStudentData = {
    ...sampleTeacherData,
    email: 'student@example.com',
    fullName: 'Example Student'
  }

  let sampleClass

  let classService
  let gradeService
  let userService
  let tokenize

  const createSampleStudent = async () => {
    return await userService.directCreateUser(sampleStudentData, 'STUDENT')
  }

  const createStudentToken = async () => {
    const student = await createSampleStudent()
    return await tokenize.sign(student, false)
  }

  const createTokenFromExistingUser = async (userId) => {
    const user = await userService.findUserById(userId)
    if (!user) throw new Error('User not found')
    return await tokenize.sign(user, false)
  }

  const createTeacherTokenFromClass = async (classroom) => {
    return await createTokenFromExistingUser(classroom.teachers[0])
  }

  beforeAll(async () => {
    classService = new ClassService()
    gradeService = new GradeService()
    userService = new UserService()
    tokenize = new Tokenize()
    await db.connectDatabase()
  })
  beforeEach(async () => {
    sampleClass = await createSampleClass(gradeService, classService, userService)
  })
  afterEach(async () => await db.clearDatabase())
  afterAll(async () => await db.disconnectDatabase())

  describe('GET /', () => {
    it('returns status code 401 error when no user authenticated', async () => {
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences`)

      expect(res.statusCode).toEqual(401)
    })

    it('returns status code 403 when authenticated user neither admin nor teacher', async () => {
      const studentToken = await createStudentToken()
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + studentToken)

      expect(res.statusCode).toEqual(403)
    })

    it("returns status code 404 when class id doesn't exists", async () => {
      const res = await request(app)
        .get('/api/v1/class/random-class-id/presences')
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))

      expect(res.statusCode).toEqual(404)
    })

    it('returns status code 200 when class exist', async () => {
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
      expect(res.statusCode).toEqual(200)
    })
  })

  describe('POST /', () => {
    const isoDate = (datestring) => new Date(datestring).toISOString()

    it('returns status code 401 error when no user authenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)

      expect(res.statusCode).toEqual(401)
    })

    it('returns status code 403 when authenticated user neither admin nor teacher', async () => {
      const studentToken = await createStudentToken()
      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + studentToken)

      expect(res.statusCode).toEqual(403)
    })

    it("returns 400 and error message when 'start' request body is not valid date", async () => {
      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
        .send({
          ...presenceData,
          start: ''
        })

      expect(res.statusCode).toEqual(400)
      expect(cleanStringify(res.body.message)).toContain('"start" must be a valid date')
    })

    it("returns 400 and error message when 'end' request body is not valid date", async () => {
      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
        .send({
          ...presenceData,
          end: ''
        })

      expect(res.statusCode).toEqual(400)
      expect(cleanStringify(res.body.message)).toContain('"end" must be a valid date')
    })

    it("returns 404 when class don't exists", async () => {
      const res = await request(app)
        .post('/api/v1/class/random-class-id/presences')
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
        .send(presenceData)

      expect(res.statusCode).toEqual(404)
    })

    it('returns status code 201 when new presence created', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
        .send(presenceData)

      expect(res.statusCode).toEqual(201)
    })

    it('returns valid presence after new presence created', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
        .send(presenceData)

      const data = res.body.data

      expect(data.start).toEqual(isoDate(presenceData.start))
      expect(data.end).toEqual(isoDate(presenceData.end))
    })

    it('returns 409 when there is an opened presence', async () => {
      const token = await createTeacherTokenFromClass(sampleClass)
      const currentPresenceData = {
        start: new Date(),
        end: new Date().setHours(new Date().getHours() + 1)
      }

      await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(currentPresenceData)

      const res = await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(presenceData)

      expect(res.statusCode).toEqual(409)
    })
  })
})

module.exports = {
  createSampleClass,
  presenceData,
  anotherPresenceData
}
