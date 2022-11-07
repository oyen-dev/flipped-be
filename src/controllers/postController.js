const { ClientError } = require('../errors')

class PostController {
  constructor (classService, userService, postService, taskService, attachmentService, validator, tokenize, response) {
    this.name = 'PostController'
    this._classService = classService
    this._userService = userService
    this._postService = postService
    this._taskService = taskService
    this._attachmentService = attachmentService
    this._validator = validator
    this._tokenize = tokenize
    this._response = response

    this.addPost = this.addPost.bind(this)
  }

  async addPost (req, res) {
    const token = req.headers.authorization
    const classId = req.params.id
    const payload = req.body

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Make sure user is TEACHER
      if (user.role !== 'TEACHER') throw new ClientError('Unauthorized to create post', 401)

      // Find class
      const classData = await this._classService.getClass(classId)

      // Make sure teacher is in class
      for (const teacher of classData.teachers) {
        if (!teacher._id.includes(user._id)) throw new ClientError('Unauthorized to post in this class', 401)
      }

      //   Add classId to payload
      payload.classId = classId
      payload.teacherId = user._id

      // Validate payload
      this._validator.validateCreatePost(payload)

      // Get deadline of payload
      const deadline = payload.deadline

      // Remove deadline from payload
      delete payload.deadline

      // Create post
      const post = await this._postService.createPost(payload)

      let task = null
      // If post is task, create task
      if (payload.isTask) {
        task = await this._taskService.createTask(deadline, post._id)

        // Update post with task id
        post.taskId = task._id
        await post.save()
      }

      // Change attachment data in db with post id
      for (const attachment of payload.attachments) {
        await this._attachmentService.updateAttachmentPostId(attachment, post._id)
      }

      // Response
      const response = this._response.success(200, 'Post created!')

      return res.status(200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  PostController
}
