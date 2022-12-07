const { faker } = require('@faker-js/faker')
const { PresenceService, ClassService } = require('../../src/services')
const { toDateTimeString } = require('./common')

const generatePresencePayload = () => {
  const start = faker.date.past()
  const end = new Date(start).setHours(start.getHours() + 2)

  return {
    start: toDateTimeString(start),
    end: toDateTimeString(end)
  }
}

async function createPresence (classroom, payload) {
  if (!payload) {
    payload = generatePresencePayload()
  }

  return await new PresenceService(new ClassService()).addPresence(payload, classroom)
}

function sortPresencesByDate (presences) {
  return presences.sort(
    (a, b) => {
      return new Date(b.end).getTime() - new Date(a.end).getTime()
    }
  )
}

module.exports = {
  generatePresencePayload,
  createPresence,
  sortPresencesByDate
}
