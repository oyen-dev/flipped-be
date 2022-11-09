const { ClientError } = require('../errors')
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
}

module.exports = {
  PostService
}
