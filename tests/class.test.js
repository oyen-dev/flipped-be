const should = require('should')
const { app } = require('../src/app')
const request = require('supertest')
const { createStudentToken, createToken } = require('./extensions/auth')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('./extensions/database')
const { createTeacher } = require('./extensions/user')
const { generateClassPayload } = require('./extensions/class')

describe('Class routes', () => {
    beforeAll(async () => {
        await connectDatabase()
    })
    afterEach(async () => {
        await clearDatabase()
    })
    afterAll(async () => {
        await disconnectDatabase()
    })

    describe('POST /api/v1/class', () => {
        const createClassPath = () => '/api/v1/class'
        const createTeachers = async (amount) => {
            const teachers = []
            for (let i = 0; i < amount; i++) {
                teachers.push(await createTeacher())
            }
            return teachers
        }

        it('returns 401 when no authenticated user', async () => {
            const res = await request(app)
                .post(createClassPath())

            res.statusCode.should.be.eql(401)
        })

        it('returns 403 when authenticated user neither ADMIN nor TEACHER', async () => {
            const studentToken = await createStudentToken()
            const res = await request(app)
                .post(createClassPath())
                .auth(studentToken, { type: 'bearer' })

            res.statusCode.should.be.eql(403)
        })

        it('returns 404 when there are invalid "teachers" id payload', async () => {
            const teachers = await createTeachers(1)
            const payload = {
                ...generateClassPayload(),
                teachers: [
                    ...teachers.map(teacher => teacher._id),
                    'invalid-id'
                ]
            }
            const token = await createToken(teachers[0])

            const res = await request(app)
                .post(createClassPath())
                .auth(token, { type: 'bearer' })
                .send(payload)

            res.statusCode.should.be.eql(404)
        })

        it('returns 200 and a new classroom', async () => {
            const teachers = await createTeachers(1)
            const payload = {
                ...generateClassPayload(),
                teachers: teachers.map(teacher => teacher._id)
            }
            const token = await createToken(teachers[0])

            const res = await request(app)
                .post(createClassPath())
                .auth(token, { type: 'bearer' })
                .send(payload)

            res.statusCode.should.be.eql(200)
            res.body.should.be.Object()

            const data = res.body.data
            data.should.be.Object()
            data.name.should.be.eql(payload.name)
            data.invitationCode.should.be.String()
            data._id.should.be.String()
        })

        it('returns a classroom with 100 teachers with response time below than 200ms', async () => {
            const teachers = await createTeachers(100)
            const payload = {
                ...generateClassPayload(),
                teachers: teachers.map(teacher => teacher._id)
            }
            const token = await createToken(teachers[0])

            const startTestTime = new Date().getTime()

            const res = await request(app)
                .post(createClassPath())
                .auth(token, { type: 'bearer' })
                .send(payload)

            const endTestTime = new Date().getTime()
            const totalTestTime = endTestTime - startTestTime

            res.statusCode.should.be.eql(200)
            res.body.should.be.Object()

            const data = res.body.data
            data.should.be.Object()
            data.name.should.be.eql(payload.name)
            data.invitationCode.should.be.String()
            data._id.should.be.String()

            totalTestTime.should.be.lessThan(200)
        })
    })

})