const { Class } = require('../../src/models/class.js')
const { Presence } = require('../../src/models/presence.js')
const { ClassService } = require('../../src/services/classService.js')
const { PresenceService } = require('../../src/services/presenceService.js')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../database.js')
const { createClass } = require('../extensions/class')
const { generatePresencePayload } = require('../extensions/presence.js')
const { createTeacher } = require('../extensions/user')
const should = require('should')

describe('PresenceService', () => {
  const createSampleClass = async () => {
    const teacher = await createTeacher()
    const grade = 'Grade'
    return await createClass(null, [teacher], grade)
  }

  let presenceService
  let classService

  const toDate = (dateString) => new Date(dateString)

  beforeAll(async () => {
    classService = new ClassService()
    presenceService = new PresenceService(classService)
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
      const presencePayloads = [
        generatePresencePayload(),
        generatePresencePayload()
      ]
      let classroom = await createClass()
      await presenceService.addPresence(presencePayloads[0], classroom)
      classroom = await classService.getClass(classroom._id)
      await presenceService.addPresence(presencePayloads[1], classroom)
      classroom = await classService.getClass(classroom._id)

      // Sort payload by end time descending
      const sortedPayloads = presencePayloads.sort(
        (a, b) => {
          return new Date(b.end).getTime() - new Date(a.end).getTime()
        }
      )

      const presences = presenceService.getAllPresences(classroom)
      presences[0].start.should.be.eql(toDate(sortedPayloads[0].start))
      presences[0].end.should.be.eql(toDate(sortedPayloads[0].end))
      presences[1].start.should.be.eql(toDate(sortedPayloads[1].start))
      presences[1].end.should.be.eql(toDate(sortedPayloads[1].end))
    })
  })
})
