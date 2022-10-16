const { Class } = require('../models/class')

class ClassService {
  constructor () {
    this.name = 'ClassService'
  }

  async addClass (payload) {
    return await Class.create(payload)
  }

  async test (id) {
    // find class by id then populate teachers
    return await Class.find({ _id: id }).populate('teachers').populate('gradeId')
  }
}

module.exports = {
  ClassService
}
