const { Class } = require('../../src/models/class.js')
const { Presence } = require('../../src/models/presence.js')
const { ClassService } = require('../../src/services/classService.js')
const { GradeService } = require('../../src/services/gradeService.js')
const { PresenceService } = require('../../src/services/presenceService.js')
const { UserService } = require('../../src/services/userService.js')
const { connectDatabase, clearDatabase, disconnectDatabase } = require('../database.js')
const { createSampleClass, presenceData, anotherPresenceData } = require('../presences.test.js')

describe('presenceService', () => {
  const now = new Date()

  const sampleOpenedPresence = {
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
  const samplePresences = [
    {
      _id: '111',
      start: new Date('2020-05-01 11:00:00'),
      end: new Date('2020-05-01 12:00:00'),
      studenPresences: [
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
      studenPresences: []
    }
  ]
  const samplePresencesWithOpenedOne = [
    ...samplePresences,
    sampleOpenedPresence
  ]

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

  beforeEach(async () => {
    sampleClass = await createSampleClass(gradeService, classService, userService)
  })

  afterEach(async () => {
    await clearDatabase()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  describe('filterCurrentPresence', () => {
    it('returns null when there are no presences', () => {
      const currentPresence = presenceService.filterCurrentPresence([])
      expect(currentPresence).toBeNull()
    })

    it('returns null when there are no presences having end time greeter than current time', () => {
      const currentPresence = presenceService.filterCurrentPresence(samplePresences)
      expect(currentPresence).toBeNull()
    })

    it('returns a presence when there is a presence having end time greeter than current time', () => {
      const currentPresence = presenceService.filterCurrentPresence(samplePresencesWithOpenedOne)
      expect(currentPresence).not.toBeNull()
    })
  })

  describe('addPresence', () => {
    it('returns a new presence with id', async () => {
      const presence = await presenceService.addPresence(presenceData, sampleClass)

      expect(presence.start).toEqual(toDate(presenceData.start))
      expect(presence.end).toEqual(toDate(presenceData.end))
      expect(presence._id).not.toBeUndefined()
    })

    it('save a new presence in database', async () => {
      const result = await presenceService.addPresence(presenceData, sampleClass)
      const presence = await Presence.findById(result._id)

      expect(presence).not.toBeNull()
      expect(presence.start).toEqual(toDate(presenceData.start))
      expect(presence.end).toEqual(toDate(presenceData.end))
      expect(presence.studentPresences).toEqual([])
      expect(presence.createdAt).not.toBeNull()
      expect(presence.updatedAt).not.toBeNull()
      expect(presence._id).toBe(result._id)
    })

    it('bind a new presence to the classroom', async () => {
      const result = await presenceService.addPresence(presenceData, sampleClass)
      const classroom = await Class.findById(sampleClass._id)

      expect(classroom.presences).toContain(result._id)
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
