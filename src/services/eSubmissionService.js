const { ClientError } = require('../errors')
const { eSubmission, Evaluation, Answer } = require('../models')

class ESubmissionService {
  constructor () {
    this.name = 'ESubmissionService'
  }

  async createSubmission (payload) {
    // Destructure payload
    const { answers, evaluationId, studentId, reaction } = payload

    const evaluation = await this.getEvaluationById(payload.evaluationId)
    if (!evaluation) throw new ClientError('Evaluation not found', 404)

    // Iterate question and create answer
    const answerList = []
    let points = 0
    for (let i = 0; i < evaluation.questions.length; i++) {
      const question = evaluation.questions[i]
      const answer = await this.createAnswer({
        questionId: question._id,
        answer: answers[i].answer
      })

      answerList.push(answer._id)
      if (question._id === answers[i].questionId && question.key === answers[i].answer) points++
    }

    // Count points
    points = (points / evaluation.questions.length) * 100

    // Create submission
    const submission = await eSubmission.create({
      answers: answerList,
      evaluationId,
      studentId,
      points,
      reaction
    })

    // Update evaluation
    evaluation.submissions.push(submission._id)
    await evaluation.save()

    return submission
  }

  async updateSubmission (_id, payload) {
    return await eSubmission.findByIdAndUpdate(_id, payload, { new: true })
  }

  async getEvaluationById (_id) {
    return await Evaluation.findById(_id)
      .select('_id questions submissions')
      .populate({ path: 'questions', select: '_id key' })
      .exec()
  }

  async createAnswer (payload) {
    return await Answer.create(payload)
  }

  async checkSubmission (evaluationId, studentId) {
    const submission = await eSubmission.findOne({ evaluationId, studentId })
    return submission || null
  }

  async getEvaluationResult (evaluationId, studentId) {
    const submission = await eSubmission.findOne({ evaluationId, studentId })
      .select('_id points reaction answers createdAt')
      .populate([
        { path: 'answers', select: '_id questionId answer', populate: { path: 'questionId', select: '_id question options key' } }
      ])
      .lean()

    return submission || null
  }
}

module.exports = {
  ESubmissionService
}
