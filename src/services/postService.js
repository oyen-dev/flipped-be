const { Post } = require('../models')
class PostService {
  constructor () {
    this.name = 'PostService'
  }

  async createPost (payload) {
    return await Post.create(payload)
  }
}

module.exports = {
  PostService
}
