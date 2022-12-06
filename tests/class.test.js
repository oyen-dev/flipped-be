const should = require('should')
const { app } = require('../src/app')
const request = require('supertest')
const { createStudentToken } = require('./extensions/auth')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('./extensions/database')

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

        it('returns 401 when no authenticated user', async () => {
            const res = await request(app)
                .post(createClassPath())

            res.statusCode.should.be.eql(401)
        })

        it('returns 403 when authenticated user neither ADMIN nor TEACHER', async () => {
            const token = await createStudentToken()
            console.log(token)
            const res = await request(app)
                .post(createClassPath())
                .auth(await createStudentToken(), { type: 'bearer' })

            res.statusCode.should.be.eql(403)
        })
    })

})