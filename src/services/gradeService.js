// const { ClientError } = require('../errors')
const { Grade } = require('../models')

class GradeService {
  constructor () {
    this.name = 'GradeService'
  }

  async getGrades (id) {
    return await Grade.find({ _id: id })
  }

  async getGradeByName (name) {
    return await Grade.findOne({ name })
  }

  async addGrade (name) {
    return await Grade.create({ name })
  }
}

module.exports = {
  GradeService
}
