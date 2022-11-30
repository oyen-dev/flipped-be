const { Evaluation } = require('../models')

class EvaluationService {
  constructor () {
    this.name = 'EvaluationService'
  }

  async createEvaluation (payload) {
    return await Evaluation.create(payload)
  }

  async updateEvaluation (_id, payload) {
    return await Evaluation.findByIdAndUpdate(_id, payload, { new: true })
  }

  async getClassEvaluations (classId) {
    return await Evaluation.find({ classId })
  }

  async getEvaluationById (_id) {
    return await Evaluation.findById(_id)
  }
}

module.exports = {
  EvaluationService
}
