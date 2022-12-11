const request = require('supertest')
const { app } = require('../src/app')
const db = require('./database')
const { cleanStringify } = require('./extension')
const { createTeacher } = require('./extensions/user')
const { createClass } = require('./extensions/class')
const { createStudentToken, createTeacherToken } = require('./extensions/auth')
const should = require('should')
const { createPresence, sortPresencesByDate, generatePresencePayload, generateStudentPresencePayload, createCurrentPresence } = require('./extensions/presence')
const { toDateTimeString } = require('./extensions/common')

describe('Presence Route', () => {
  let classroom

  const createTokenFromClassroom = async (classroom) => {
    return await createTeacherToken({ _id: classroom.teachers[0] })
  }

  const isoDate = (datestring) => new Date(datestring).toISOString()
  const appendPresence = async (classroom, payload) => {
    const presence = await createPresence(classroom, payload)
    classroom.presences.push(presence)
    return presence
  }
  const createSampleClass = async () => {
    const teacher = await createTeacher()
    const grade = 'Grade'
    return await createClass(null, [teacher], grade)
  }

  beforeAll(async () => {
    await db.connectDatabase()
  })
  beforeEach(async () => {
    classroom = await createSampleClass()
  })
  afterEach(async () => await db.clearDatabase())
  afterAll(async () => await db.disconnectDatabase())

  describe('GET /api/v1/class/{classId}/presences', () => {
    const getPresencesPath = (classroom) => `/api/v1/class/${classroom._id}/presences`

    it('returns status code 401 error when no user authenticated', async () => {
      const res = await request(app)
        .get(getPresencesPath(classroom))

      res.statusCode.should.be.eql(401)
    })

    it('returns status code 403 when authenticated user neither admin nor teacher', async () => {
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

    it('returns 403 when authenticated teacher is not assigned to the class', async () => {
      const anotherTeacherToken = await createTeacherToken()
      const res = await request(app)
        .get(getPresencesPath(classroom))
        .auth(anotherTeacherToken, { type: 'bearer' })

      res.statusCode.should.be.eql(403)
    })

    it('returns status code 200', async () => {
      const res = await request(app)
        .get(getPresencesPath(classroom))
        .auth(await createTokenFromClassroom(classroom), {
          type: 'bearer'
        })
      expect(res.statusCode).toEqual(200)
    })

    it('returns all presences in the class sorted by end time', async () => {
      const createdPresences = [
        await appendPresence(classroom),
        await appendPresence(classroom)
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

  describe('POST /api/v1/class/{classId}/presences', () => {
    let presencePayload

    beforeEach(() => {
      presencePayload = generatePresencePayload()
    })

    it('returns 401 when no user authenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)

      res.statusCode.should.be.eql(401)
    })

    it('returns 403 when authenticated user neither admin nor teacher', async () => {
      const studentToken = await createStudentToken()
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + studentToken)

      res.statusCode.should.be.eql(403)
    })

    it("returns 400 when 'start' request body is invalid date", async () => {
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send({
          ...presencePayload,
          start: ''
        })

      res.statusCode.should.be.eql(400)
      expect(cleanStringify(res.body.message)).toContain('"start" must be a valid date')
    })

    it("returns 400 when 'end' request body is invalid date", async () => {
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send({
          ...presencePayload,
          end: ''
        })

      res.statusCode.should.be.eql(400)
      expect(cleanStringify(res.body.message)).toContain('"end" must be a valid date')
    })

    it("returns 404 when class don't exists", async () => {
      const res = await request(app)
        .post('/api/v1/class/random-class-id/presences')
        .set('Authorization', 'Bearer ' + await createTeacherToken())
        .send(presencePayload)

      expect(res.statusCode).toEqual(404)
    })

    it('returns 403 when the teacher is not assigned to the class', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTeacherToken())
        .send(presencePayload)

      res.statusCode.should.be.eql(403)
    })

    it('returns 201 when new presence created', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send(presencePayload)

      res.statusCode.should.eql(201)
    })

    it('returns valid presence after new presence created', async () => {
      const res = await request(app)
        .post(`/api/v1/class/${classroom._id}/presences`)
        .set('Authorization', 'Bearer ' + await createTokenFromClassroom(classroom))
        .send(presencePayload)

      const data = res.body.data
      data.start.should.be.eql(isoDate(presencePayload.start))
      data.end.should.be.eql(isoDate(presencePayload.end))
      data.studentPresences.should.be.eql([])
    })

    it('returns 409 when there is an opened presence', async () => {
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
        .send(presencePayload)

      res.statusCode.should.be.eql(409)
    })
  })

  describe('GET /api/v1/class/{classId}/presences/current', () => {
    const currentPresencePath = (classroom) => `/api/v1/class/${classroom._id}/presences/current`

    it('returns status code 401 error when no user authenticated', async () => {
      const res = await request(app)
        .get(currentPresencePath(classroom))

      res.statusCode.should.be.eql(401)
    })

    it("returns status code 404 when class id doesn't exists", async () => {
      const res = await request(app)
        .get(currentPresencePath({ _id: 'invalid-id' }))
        .auth(await createTokenFromClassroom(classroom), { type: 'bearer' })

      res.statusCode.should.be.eql(404)
    })

    it('returns false when the presence of the class is not opened', async () => {
      const now = new Date()
      const presencePayload = {
        start: toDateTimeString(new Date(now).setHours(now.getHours() - 5)),
        end: toDateTimeString(new Date(now).setHours(now.getHours() - 4))
      }
      await appendPresence(classroom, presencePayload)

      const res = await request(app)
        .get(currentPresencePath(classroom))
        .auth(await createTokenFromClassroom(classroom), { type: 'bearer' })

      res.statusCode.should.be.eql(200)
      res.body.data.isOpen.should.be.eql(false)
    })

    it('returns true when the presence of the class is opened', async () => {
      const now = new Date()
      const presencePayload = {
        start: toDateTimeString(now),
        end: toDateTimeString(new Date(now).setHours(now.getHours() + 2))
      }
      await appendPresence(classroom, presencePayload)

      const res = await request(app)
        .get(currentPresencePath(classroom))
        .auth(await createTokenFromClassroom(classroom), { type: 'bearer' })

      res.statusCode.should.be.eql(200)
      res.body.data.isOpen.should.be.eql(true)
    })
  })

  describe('POST /api/v1/class/{classId}/presences/current', () => {
    let attendancePayload, studentToken
    const submitPresencePath = (classroom) => `/api/v1/class/${classroom._id}/presences/current`

    beforeEach(async () => {
      attendancePayload = generateStudentPresencePayload()
      studentToken = await createStudentToken()
    })

    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .send(attendancePayload)

      res.statusCode.should.be.eql(401)
    })

    it('returns 403 when authenticated user is not student', async () => {
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(await createTeacherToken(), { type: 'bearer' })
        .send(attendancePayload)

      res.statusCode.should.be.eql(403)
    })

    it('requires "attendance" field', async () => {
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send({
          ...attendancePayload,
          attendance: undefined
        })

      res.statusCode.should.be.eql(400)
    })

    it('requires "reaction" field', async () => {
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send({
          ...attendancePayload,
          reaction: undefined
        })

      res.statusCode.should.be.eql(400)
    })

    it("returns 404 when class don't exists", async () => {
      const res = await request(app)
        .post(submitPresencePath({_id: 'invalid'}))
        .set('Authorization', 'Bearer ' + await createStudentToken())
        .send(attendancePayload)

      expect(res.statusCode).toEqual(404)
    })

    it('returns 404 when there is no active presences', async () => {
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send(attendancePayload)
      res.statusCode.should.be.eql(404)
    })

    it('returns 200 when submitting presence succeeded', async () => {
      await createCurrentPresence(classroom)
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send(attendancePayload)
      res.statusCode.should.be.eql(200)
    })

    it('returns true when success', async () => {
      await createCurrentPresence(classroom)
      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send(attendancePayload)
      res.body.data.should.be.eql(true)
    })

    it('returns 403 when submitting presence twice or more', async () => {
      await createCurrentPresence(classroom)
      await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send(attendancePayload)

      const res = await request(app)
        .post(submitPresencePath(classroom))
        .auth(studentToken, { type: 'bearer' })
        .send(attendancePayload)
      res.statusCode.should.be.eql(403)
    })
  })
})
