const { Evaluation } = require('../models')
const { ClientError } = require('../errors')

class EvaluationService {
  constructor () {
    this.name = 'EvaluationService'
  }

  async createEvaluation (payload) {
    return await Evaluation.create(payload)
  }

  async updateEvaluation (_id, payload) {
    const wilBeUpdated = await Evaluation.findById(_id)

    if (!wilBeUpdated) throw new ClientError('Evaluation not found', 404)

    return await Evaluation.findByIdAndUpdate(_id, payload, { new: true })
  }

  async getEvaluationById (_id) {
    return await Evaluation.findById(_id).exec()
  }

  async getClassEvaluations (classId) {
    const evaluations = await Evaluation.find({ classId })
      .select('_id title teacherId deadline')
      .populate([
        { path: 'teacherId', select: 'fullName picture' }
      ])
      .sort({ 'deadline.start': -1 })
      .lean()

    return evaluations || []
  }

  async getEvaluationDetail (_id) {
    const evaluation = await Evaluation.findById(_id)
      .select('_id title teacherId deadline questions')
      .populate([
        { path: 'teacherId', select: 'fullName picture' },
        { path: 'questions', select: '_id question options key' }
      ])
      .lean()

    return evaluation || {}
  }
}

module.exports = {
  EvaluationService
}
