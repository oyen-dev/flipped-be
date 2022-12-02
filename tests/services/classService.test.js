const { ClassService } = require('../../src/services/classService')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../extensions/database')
const should = require('should')
const { generateClassPayload } = require('../extensions/class')

describe('ClassService', () => {
  let classService

  beforeAll(async () => {
    await connectDatabase()

    classService = new ClassService()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('addClass', () => {
    it('returns class', async () => {
      const classPayload = generateClassPayload()
      const classroom = await classService.addClass(classPayload)

      classroom.should.not.be.null()
      classroom.name.should.equal(classPayload.name)
    })
  })
})
