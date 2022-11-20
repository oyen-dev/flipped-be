// const { ClientError } = require('../errors')
const { Post } = require('../models')
class PostService {
  constructor () {
    this.name = 'PostService'
  }

  async createPost (payload) {
    return await Post.create(payload)
  }

  async updatePost (postId, payload) {
    return await Post.findByIdAndUpdate(postId, payload, { new: true })
  }

  async getPostTaskInfo (_id) {
    return await Post.findById(_id).select('isTask taskId').exec()
  }

  async getAttachments (postId) {
    const arrayOfAttachments = await Post.findById(postId)
      .populate({ path: 'attachments', select: 'url' })
      .select('attachments')
      .exec()

    return arrayOfAttachments.attachments
  }

  async deletePost (_id) {
    return await Post.findByIdAndDelete(_id)
  }

  async getPostById (_id) {
    return await Post.findById(_id)
  }
}

module.exports = {
  PostService
}
