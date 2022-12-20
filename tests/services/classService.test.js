const { ClassService } = require('../../src/services/classService')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../extensions/database')
const { generateClassPayload, createClass } = require('../extensions/class')
const { createTeacher } = require('../extensions/user')
const should = require('should')

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

  describe('isTeacherInClass', () => {
    const createTwoTeachers = async () => {
      return [
        await createTeacher(),
        await createTeacher()
      ]
    }
    it('returns false if the teacher not in the class', async () => {
      const teachers = await createTwoTeachers()
      const classroom = await createClass(null, [teachers[0]], 'Test')

      const teacherInClass = classService.isTeacherInClass(classroom, teachers[1])
      teacherInClass.should.be.eql(false)
    })

    it('returns true if the teacher in the class', async () => {
      const teachers = await createTwoTeachers()
      const classroom = await createClass(null, [teachers[0], teachers[1]], 'Test')

      const teacherInClass = classService.isTeacherInClass(classroom, teachers[1])
      teacherInClass.should.be.eql(true)
    })
  })
})
