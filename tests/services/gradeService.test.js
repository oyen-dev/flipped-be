const { GradeService } = require('../../src/services/gradeService')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../extensions/database')
const should = require('should')

describe('GradeService', () => {
  let gradeService

  beforeAll(async () => {
    await connectDatabase()
    gradeService = new GradeService()
  })
  afterEach(async () => {
    await clearDatabase()
  })
  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('addGrade', () => {
    it('requires name', async () => {
      await expect(async () => { await gradeService.addGrade() }).rejects.toThrow()
    })

    it('returns Grade document', async() => {
      const name = '12'
      const grade = await gradeService.addGrade(name)

      grade.should.be.an.Object()
      grade.name.should.be.a.String().and.be.eql(name)
      grade.createdAt.should.be.a.Date()
      grade.updatedAt.should.be.a.Date()
      grade._id.should.be.a.String()
    })
  })
})
