const request = require('supertest')
const { app } = require('../src/app')
const { ClassService, GradeService, UserService } = require('../src/services')
const { Tokenize } = require('../src/utils')
const db = require('./database')
const { cleanStringify } = require('./extension')
const { createTeacher } = require('./extensions/user')
const { createClass } = require('./extensions/class')
const { createStudentToken, createTeacherToken } = require('./extensions/auth')
const should = require('should')

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

const createSampleClass = async () => {
  const teacher = await createTeacher()
  const grade = 'Grade'
  return await createClass(null, [teacher], grade)
}

describe('Presence Route', () => {
  const sampleStudentData = {
    ...sampleTeacherData,
    email: 'student@example.com',
    fullName: 'Example Student'
  }

  let sampleClass

  let userService
  let tokenize

  const createSampleStudent = async () => {
    return await userService.directCreateUser(sampleStudentData, 'STUDENT')
  }

  const createTokenFromExistingUser = async (userId) => {
    const user = await userService.findUserById(userId)
    if (!user) throw new Error('User not found')
    return await tokenize.sign(user, false)
  }

  const createTokenFromClassroom = async (classroom) => {
    return await createTeacherToken({ _id: classroom.teachers[0] })
  }

  const isoDate = (datestring) => new Date(datestring).toISOString()

  beforeAll(async () => {
    classService = new ClassService()
    gradeService = new GradeService()
    userService = new UserService()
    tokenize = new Tokenize()
    await db.connectDatabase()
  })
  beforeEach(async () => {
    // sampleClass = await createSampleClass(gradeService, classService, userService)
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

    it('returns status code 200', async () => {
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))
      expect(res.statusCode).toEqual(200)
    })

    it('returns all presences in the class sorted by end time', async () => {
      const token = await createTeacherTokenFromClass(sampleClass)
      await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(anotherPresenceData)
      await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(presenceData)

      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)

      const presences = res.body.data

      expect(presences[0].start).toEqual(isoDate(anotherPresenceData.start))
      expect(presences[0].end).toEqual(isoDate(anotherPresenceData.end))
      expect(presences[1].start).toEqual(isoDate(presenceData.start))
      expect(presences[1].end).toEqual(isoDate(presenceData.end))
    })
  })

  describe('POST /', () => {
    it('returns 401 when no user authenticated', async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)

      res.statusCode.should.be.eql(401)
    })

    it('returns 403 when authenticated user neither admin nor teacher', async () => {
      const studentToken = await createStudentToken()
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + studentToken)

      res.statusCode.should.be.eql(403)
    })

    it("returns 400 when 'start' request body is invalid date", async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send({
          ...presenceData,
          start: ''
        })

      res.statusCode.should.be.eql(400)
      expect(cleanStringify(res.body.message)).toContain('"start" must be a valid date')
    })

    it("returns 400 when 'end' request body is invalid date", async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send({
          ...presenceData,
          end: ''
        })

      res.statusCode.should.be.eql(400)
      expect(cleanStringify(res.body.message)).toContain('"end" must be a valid date')
    })

    it("returns 404 when class don't exists", async () => {
      const res = await request(app)
        .post('/api/v1/class/random-class-id/presences')
        .set('Authorization', 'Bearer ' + await createTeacherToken())
        .send(presenceData)

      expect(res.statusCode).toEqual(404)
    })

    it('returns 201 when new presence created', async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send(presenceData)

      res.statusCode.should.eql(201)
    })

    it('returns valid presence after new presence created', async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send(presenceData)

      const data = res.body.data

      data.start.should.be.eql(isoDate(presenceData.start))
      data.end.should.be.eql(isoDate(presenceData.end))
    })

    it('returns 409 when there is an opened presence', async () => {
      const classroom = await createSampleClass()
      const token = await createTokenFromClassroom(classroom)
      const currentPresenceData = {
        start: new Date(),
        end: new Date().setHours(new Date().getHours() + 1)
      }

      await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(currentPresenceData)

      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(presenceData)

      res.statusCode.should.be.eql(409)
    })
  })

  describe('GET /current', () => {
    it('returns status code 401 error when no user authenticated', async () => {
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences/current`)

      expect(res.statusCode).toEqual(401)
    })

    it("returns status code 404 when class id doesn't exists", async () => {
      const res = await request(app)
        .get('/api/v1/class/random-class-id/presences/current')
        .set('Authorization', 'Bearer ' + await createTeacherTokenFromClass(sampleClass))

      expect(res.statusCode).toEqual(404)
    })

    it('returns false when the presence of the class is not opened', async () => {
      const token = await createTeacherTokenFromClass(sampleClass)

      await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send(presenceData)
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences/current`)
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(200)
      expect(res.body.data.isOpen).toEqual(false)
    })

    it('returns true when the presence of the class is opened', async () => {
      const token = await createTeacherTokenFromClass(sampleClass)
      const now = new Date()

      await request(app)
        .post(`/api/v1/class/${sampleClass._id}/presences`)
        .set('Authorization', 'Bearer ' + token)
        .send({
          start: now,
          end: new Date(now).setHours(now.getHours() + 2)
        })
      const res = await request(app)
        .get(`/api/v1/class/${sampleClass._id}/presences/current`)
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(200)
      expect(res.body.data.isOpen).toEqual(true)
    })
  })
})

module.exports = {
  createSampleClass,
  presenceData,
  anotherPresenceData
}
