const { Class } = require('../../src/models/class.js')
const { Presence } = require('../../src/models/presence.js')
const { ClassService } = require('../../src/services/classService.js')
const { GradeService } = require('../../src/services/gradeService.js')
const { PresenceService } = require('../../src/services/presenceService.js')
const { UserService } = require('../../src/services/userService.js')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../database.js')
const { createClass } = require('../extensions/class')
const { generatePresencePayload } = require('../extensions/presence.js')
const { createTeacher } = require('../extensions/user')
const should = require('should')
const { toDateTimeString } = require('../extensions/common.js')

describe('presenceService', () => {
  const createSampleClass = async () => {
    const teacher = await createTeacher()
    const grade = 'Grade'
    return await createClass(null, [teacher], grade)
  }

  let presenceService
  let classService
  let userService
  let gradeService

  let sampleClass

  const toDate = (dateString) => new Date(dateString)

  beforeAll(async () => {
    classService = new ClassService()
    presenceService = new PresenceService(classService)
    userService = new UserService()
    gradeService = new GradeService()
    await connectDatabase()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('filterCurrentPresence', () => {
    const now = new Date()
    const samplePresences = [
      {
        _id: '111',
        start: new Date('2020-05-01 11:00:00'),
        end: new Date('2020-05-01 12:00:00'),
        studentPresences: [
          {
            _id: '111',
            studentId: '222',
            at: new Date('2020-05-01 11:59:30'),
            reaction: 4
          }
        ]
      },
      {
        _id: '112',
        start: new Date('2020-02-01 09:00:00'),
        end: new Date('2020-02-01 11:00:00'),
        studentPresences: []
      }
    ]
    const samplePresencesWithOpenedOne = [
      ...samplePresences,
      {
        _id: '113',
        start: new Date(now).setHours(now.getHours() - 1),
        end: new Date(now).setHours(now.getHours() + 1),
        studenPresences: [
          {
            _id: '111',
            studentId: '222',
            at: now,
            reaction: 4
          }
        ]
      }
    ]

    it('returns null when there are no presences', () => {
      const currentPresence = presenceService.filterCurrentPresence([])
      expect(currentPresence).toBeNull()
    })

    it('returns null when there are no presences having end time greeter than current time', () => {
      const presencePayload = generatePresencePayload()
      const currentPresence = presenceService.filterCurrentPresence(samplePresences)
      expect(currentPresence).toBeNull()
    })

    it('returns a presence when there is a presence having end time greeter than current time', () => {
      const currentPresence = presenceService.filterCurrentPresence(samplePresencesWithOpenedOne)
      expect(currentPresence).not.toBeNull()
    })
  })

  describe('addPresence', () => {
    const getRequiredPresenceData = async () => {
      const classroom = await createSampleClass()
      const presencePayload = generatePresencePayload()

      return {
        classroom,
        presencePayload
      }
    }

    it('returns a new presence with id', async () => {
      const { presencePayload, classroom } = await getRequiredPresenceData()
      const presence = await presenceService.addPresence(presencePayload, classroom)

      presence.start.should.be.eql(new Date(presencePayload.start))
      presence.end.should.be.eql(new Date(presencePayload.end))
      presence._id.should.not.be.Undefined()
    })

    it('save a new presence in database', async () => {
      const { presencePayload, classroom } = await getRequiredPresenceData()
      const result = await presenceService.addPresence(presencePayload, classroom)
      const presence = await Presence.findById(result._id)

      presence.should.not.be.Null()
      presence.start.should.be.eql(new Date(presencePayload.start))
      presence.end.should.be.eql(new Date(presencePayload.end))
      presence.studentPresences.should.be.eql([])
      presence.createdAt.should.be.Date()
      presence.updatedAt.should.be.Date()
      should(presence.deletedAt).be.null()
      presence._id.should.be.eql(result._id)
    })

    it('bind a new presence to the classroom', async () => {
      const { presencePayload, classroom } = await getRequiredPresenceData()
      const result = await presenceService.addPresence(presencePayload, classroom)
      const foundClassroom = await Class.findById(classroom._id)

      foundClassroom.presences.should.containDeep([result._id])
    })
  })

  describe('getAllPresences', () => {
    it('returns valid array of presence sorted by end time', async () => {
      await presenceService.addPresence(anotherPresenceData, sampleClass)
      let newClass = await classService.getClass(sampleClass._id)
      await presenceService.addPresence(presenceData, newClass)
      newClass = await classService.getClass(sampleClass._id)

      const presences = presenceService.getAllPresences(newClass)
      expect(presences[0].start).toEqual(toDate(anotherPresenceData.start))
      expect(presences[0].end).toEqual(toDate(anotherPresenceData.end))
      expect(presences[1].start).toEqual(toDate(presenceData.start))
      expect(presences[1].end).toEqual(toDate(presenceData.end))
    })
  })
})
