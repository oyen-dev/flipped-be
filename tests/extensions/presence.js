const { faker } = require('@faker-js/faker')
const { toDateTimeString } = require('./common')

const generatePresencePayload = () => {
  const start = faker.date.past()
  const end = new Date(start).setHours(start.getHours() + 2)

  return {
    start: toDateTimeString(start),
    end: toDateTimeString(end)
  }
}

module.exports = {
  generatePresencePayload
}
