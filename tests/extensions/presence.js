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

async function createPresence(classroom, payload) {
  if (!payload) {
    payload = generatePresencePayload()
  }

  return await new PresenceService(new ClassService()).addPresence(payload, classroom)
}

async function createCurrentPresence(classroom) {
  const now = new Date()
  const payload = {
    ...generatePresencePayload(),
    start: now,
    end: new Date(now).setHours(now.getHours() + 2)
  }
  return await createPresence(classroom, payload)
}

function sortPresencesByDate(presences) {
  return presences.sort(
    (a, b) => {
      return new Date(b.end).getTime() - new Date(a.end).getTime()
    }
  )
}

const generateStudentPresencePayload = () => ({
  attendance: Math.floor(Math.random() * 3 + 1),
  reaction: Math.floor(Math.random() * 5 + 1)
})

module.exports = {
  generatePresencePayload,
  createPresence,
  sortPresencesByDate,
  generateStudentPresencePayload,
  createCurrentPresence
}
