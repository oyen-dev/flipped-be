const request = require('supertest')
const { app } = require('../src/app')
const db = require('./database')
const { cleanStringify } = require('./extension')
const { createTeacher } = require('./extensions/user')
const { createClass } = require('./extensions/class')
const { createStudentToken, createTeacherToken } = require('./extensions/auth')
const should = require('should')
const { createPresence, sortPresencesByDate } = require('./extensions/presence')

const createSampleClass = async () => {
  const teacher = await createTeacher()
  const grade = 'Grade'
  return await createClass(null, [teacher], grade)
}

describe('Presence Route', () => {

  const createTokenFromClassroom = async (classroom) => {
    return await createTeacherToken({ _id: classroom.teachers[0] })
  }

  const isoDate = (datestring) => new Date(datestring).toISOString()

  beforeAll(async () => {
    await db.connectDatabase()
  })
  afterEach(async () => await db.clearDatabase())
  afterAll(async () => await db.disconnectDatabase())

  describe('GET /api/v1/class/{classId}/presences', () => {
    const getPresencesPath = (classroom) => `/api/v1/class/${classroom._id}/presences`

    it('returns status code 401 error when no user authenticated', async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .get(getPresencesPath(classroom))

      res.statusCode.should.be.eql(401)
    })

    it('returns status code 403 when authenticated user neither admin nor teacher', async () => {
      const classroom = await createSampleClass()
      const studentToken = await createStudentToken()
      const res = await request(app)
        .get(getPresencesPath(classroom))
        .auth(studentToken, { type: 'bearer' })

      res.statusCode.should.be.eql(403)
    })

    it("returns status code 404 when class id doesn't exists", async () => {
      const res = await request(app)
        .get('/api/v1/class/random-class-id/presences')
        .auth(await createTeacherToken(), { type: 'bearer' })

      res.statusCode.should.be.eql(404)
    })

    it('returns 403 when authenticated teacher is not assigned to the class', async() => {
      const classroom = await createSampleClass()
      const anotherTeacherToken = await createTeacherToken()
      const res = await request(app)
        .get(getPresencesPath(classroom))
        .auth(anotherTeacherToken, { type: 'bearer' })

      res.statusCode.should.be.eql(403)
    })

    it('returns status code 200', async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .get(getPresencesPath(classroom))
        .auth(await createTokenFromClassroom(classroom), {
          type: 'bearer'
        })
      expect(res.statusCode).toEqual(200)
    })

    it('returns all presences in the class sorted by end time', async () => {
      const classroom = await createSampleClass()
      const appendPresence = async () => {
        const presence = await createPresence(classroom)
        classroom.presences.push(presence)
        return presence
      }

      const createdPresences = [
        await appendPresence(),
        await appendPresence()
      ]

      const sortedPresences = sortPresencesByDate(createdPresences)

      const token = await createTokenFromClassroom(classroom)

      const res = await request(app)
        .get(getPresencesPath(classroom))
        .auth(token, {
          type: 'bearer'
        })

      const presences = res.body.data

      presences[0].start.should.be.eql(isoDate(sortedPresences[0].start))
      presences[0].end.should.be.eql(isoDate(sortedPresences[0].end))
      presences[1].start.should.be.eql(isoDate(sortedPresences[1].start))
      presences[1].end.should.be.eql(isoDate(sortedPresences[1].end))
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

    it('returns 403 when the teacher is not assigned to the class', async () => {
      const classroom = await createSampleClass()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherToken())
        .send(presenceData)

      res.statusCode.should.be.eql(403)
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
