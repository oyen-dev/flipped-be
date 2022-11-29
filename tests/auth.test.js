const { app } = require('../src/app');
const request = require('supertest')
const should = require('should');
const _ = require('lodash')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('./extensions/database');
const { generateRegisterPayload } = require('./extensions/auth');

describe('Auth Routes', () => {
  beforeAll(async () => {
    await connectDatabase()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('POST /api/v1/auth/register', () => {
    let registerPayload;

    const getRegisterResponse = async (payload) => {
      const res = request(app)
        .post('/api/v1/auth/register')
      if (payload || typeof (payload) === 'boolean') {
        res.send(payload)
      }
      return await res
    }

    beforeAll(() => {
      registerPayload = generateRegisterPayload()
    })

    it('requires email', async () => {
      const payload = _.omit(registerPayload, ['email'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires password', async () => {
      const payload = _.omit(registerPayload, ['password'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires password confirmation', async () => {
      const payload = _.omit(registerPayload, ['confirmPassword'])
      console.log(payload)
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires matched password confirmation with password', async () => {
      const payload = {
        ...registerPayload,
        confirmPassword: "it won't match the password"
      }
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires fullname', async () => {
      const payload = _.omit(registerPayload, ['fullName'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires gender', async () => {
      const payload = _.omit(registerPayload, ['gender'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires date of birth', async () => {
      const payload = _.omit(registerPayload, ['dateOfBirth'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires place of birth', async () => {
      const payload = _.omit(registerPayload, ['placeOfBirth'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('requires address', async () => {
      const payload = _.omit(registerPayload, ['address'])
      const res = await getRegisterResponse(payload)
      res.statusCode.should.equal(400)
    })

    it('returns status 200', async () => {
      const res = await getRegisterResponse(registerPayload)
      res.statusCode.should.equal(200)
    })
  })
})