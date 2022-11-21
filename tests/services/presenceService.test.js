const { PresenceService } = require('../../src/services/presenceService.js')

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

  beforeEach(() => {
    presenceService = new PresenceService()
  })

  describe('getCurrentPresence', () => {
    it('returns null when there are no presences', () => {
      const currentPresence = presenceService.getCurrentPresence([])
      expect(currentPresence).toBeNull()
    })

    it('returns null when there are no presences having end time greeter than current time', () => {
      const currentPresence = presenceService.getCurrentPresence(samplePresences)
      expect(currentPresence).toBeNull()
    })

    it('returns a presence when there is a presence having end time greeter than current time', () => {
      const currentPresence = presenceService.getCurrentPresence(samplePresencesWithOpenedOne)
      expect(currentPresence).not.toBeNull()
    })
  })
})
