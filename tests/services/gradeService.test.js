const { GradeService } = require('../../src/services/gradeService')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../extensions/database')
const { Grade } = require('../../src/models')
const should = require('should')
const { faker } = require('@faker-js/faker')

describe('GradeService', () => {
  let gradeService

  const createGrade = async () => {
    return await Grade.create({
      name: faker.word.verb()
    })
  }

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

    it('returns Grade document', async () => {
      const name = '12'
      const grade = await gradeService.addGrade(name)

      grade.should.be.an.Object()
      grade.name.should.be.a.String().and.be.eql(name)
      grade.createdAt.should.be.a.Date()
      grade.updatedAt.should.be.a.Date()
      grade._id.should.be.a.String()
    })
  })

  describe('getGrade', () => {
    it('returns null when no grades found', async () => {
      const grade = await gradeService.getGrade()
      should(grade).be.null()
    })

    it('returns grade document with matched id', async () => {
      const createdGrade = await createGrade()
      const grade = await gradeService.getGrade(createdGrade._id)
      grade.should.be.an.Object()
      grade.name.should.be.eql(createdGrade.name)
      grade.createdAt.should.be.Date()
      grade.updatedAt.should.be.Date()
      grade._id.should.be.eql(createdGrade._id)
    })
  })

  describe('getGradeByName', () => {
    it('returns null if there is no grades with matched name', async () => {
      const grade = await gradeService.getGradeByName('namee')
      should(grade).be.Null()
    })

    it('returns Grade document when the name is matched to the document', async () => {
      const createdGrade = await createGrade()
      const grade = await gradeService.getGradeByName(createdGrade.name)
      grade.should.be.an.Object()
      grade.name.should.be.eql(createdGrade.name)
      grade.createdAt.should.be.Date()
      grade.updatedAt.should.be.Date()
      grade._id.should.be.eql(createdGrade._id)
    })
  })
})
