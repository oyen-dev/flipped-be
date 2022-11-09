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
    this.getClassPosts = this.getClassPosts.bind(this)
    this.getClassPost = this.getClassPost.bind(this)
    this.updateClassPost = this.updateClassPost.bind(this)
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

      // Add classId to payload
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

      // Add post to class
      await this._classService.addPostToClass(classId, post._id)

      // Response
      const response = this._response.success(200, 'Post created!')

      return res.status(200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getClassPosts (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetClass({ id })

      // Get class
      const classDetail = await this._classService.getClassPosts(id)

      // Response
      const response = this._response.success(200, 'Get class posts success!', classDetail)

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getClassPost (req, res) {
    const token = req.headers.authorization
    const { id: classId, postId } = req.params

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

      // Validate payload
      this._validator.validateGetClassPost({ classId, postId })

      // Get post
      const post = await this._classService.getClassPost(classId, postId)

      // Response
      const response = this._response.success(200, 'Get class post success!', { post })

      return res.status(response.statsCode || 200).json(response)

      // return res.status(200).json({ message: 'Get class post success!' })
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async updateClassPost (req, res) {
    const token = req.headers.authorization
    const { id: classId, postId } = req.params
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

      // Add classId to payload
      payload.classId = classId
      payload.teacherId = user._id

      // Validate payload
      this._validator.validateUpdatePost(payload)

      // Update post
      const updatePostPayload = {
        classId: payload.classId,
        teacherId: payload.teacherId,
        title: payload.title,
        description: payload.description,
        attachments: payload.attachments,
        isTask: payload.isTask,
        updatedAt: new Date()
      }
      const updatedPost = await this._postService.updatePost(postId, updatePostPayload)

      // If isTask is true, update task
      if (payload.isTask) {
        // Check if taskId is exist, if not, create new task
        if (!updatedPost.taskId) {
          const task = await this._taskService.createTask(payload.deadline, updatedPost._id)
          updatedPost.taskId = task._id
          await updatedPost.save()
        } else {
          await this._taskService.updateTaskDeadline(updatedPost.taskId, payload.deadline)
        }
      }

      // Response
      const response = this._response.success(200, 'Update class post success!', { updatedPost })

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  PostController
}
