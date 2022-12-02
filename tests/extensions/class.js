const { faker } = require('@faker-js/faker')
const { Class } = require('../../src/models')

const generateClassPayload = () => {
  const toDateTimeString = (date) => {
    return new Date(date).toISOString().split('.')[0].replace('T', ' ')
  }
  const randomDate = faker.date.past()

  return {
    teachers: [],
    schedule: [
      {
        start: toDateTimeString(randomDate),
        end: toDateTimeString(new Date(randomDate).setHours(randomDate.getHours() + 1))
      }
    ],
    name: faker.word.noun(),
    grade: faker.word.noun()
  }
}

const createClass = async (payload, teachers, grade) => {
  let customPayload = false
  if (!payload) {
    payload = generateClassPayload()
  } else {
    customPayload = true
  }

  if (!customPayload) {
    payload.teachers = teachers
    payload.grade = grade
  }

  return await Class.create(payload)
}

module.exports = {
  generateClassPayload,
  createClass
}
