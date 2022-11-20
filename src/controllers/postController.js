const { ClientError } = require('../errors')

class PostController {
  constructor (classService, userService, postService, taskService, submissionService, attachmentService, storageService, validator, tokenize, response) {
    this.name = 'PostController'
    this._classService = classService
    this._userService = userService
    this._postService = postService
    this._taskService = taskService
    this._submissionService = submissionService
    this._attachmentService = attachmentService
    this._storageService = storageService
    this._validator = validator
    this._tokenize = tokenize
    this._response = response

    // Post
    this.addPost = this.addPost.bind(this)
    this.getClassPosts = this.getClassPosts.bind(this)
    this.getClassPost = this.getClassPost.bind(this)
    this.updateClassPost = this.updateClassPost.bind(this)
    this.deletePost = this.deletePost.bind(this)

    // Submission
    this.addSubmission = this.addSubmission.bind(this)
    this.getTaskSubmission = this.getTaskSubmission.bind(this)
    this.getTaskSubmissions = this.getTaskSubmissions.bind(this)
    this.checkSubmissionStatus = this.checkSubmissionStatus.bind(this)
    this.updateSubmission = this.updateSubmission.bind(this)
  }

  // Post
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

  async deletePost (req, res) {
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
      let isTeacherInClass = false
      for (const teacher of classData.teachers) {
        if (teacher._id.includes(user._id)) {
          isTeacherInClass = true
          break
        }
      }
      if (!isTeacherInClass) throw new ClientError('Unauthorized to post in this class', 401)

      // Validate payload
      this._validator.validateDeleteClassPost({ classId, postId })

      // If any attachment, delete it
      const arrayAttachments = await this._postService.getAttachments(postId)
      if (arrayAttachments.length > 0) {
        for (const attachment of arrayAttachments) {
          const fileName = attachment.url.split('/flipped-storage/')[1]
          await this._storageService.deleteFile(fileName)
        }
      }

      // If isTask is true, delete task
      const post = await this._postService.getPostTaskInfo(postId)
      if (post.isTask) {
        await this._taskService.deleteTask(post.taskId)
      }

      // Delete post
      await this._postService.deletePost(postId)

      // Remove post from class
      await this._classService.removePostFromClass(classId, postId)

      // Response
      const response = this._response.success(200, 'Delete class post success!')

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  // Submission
  async addSubmission (req, res) {
    const token = req.headers.authorization
    const { classId, postId } = req.params
    const payload = req.body

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Make sure user is STUDENT
      if (user.role !== 'STUDENT') throw new ClientError('Unauthorized to create submission', 401)

      // Find class
      const classData = await this._classService.getClassStudents(classId)
      if (!classData) throw new ClientError('Class not found', 404)

      // Make sure student is in class
      let isStudentInClass = false
      for (const student of classData.students) {
        if (student._id.includes(user._id)) {
          isStudentInClass = true
          break
        }
      }
      if (!isStudentInClass) throw new ClientError('Unauthorized to create submission in this class', 401)

      // Find post
      const post = await this._postService.getPostById(postId)
      if (!post) throw new ClientError('Post not found', 404)

      // Make sure post is task
      if (!post.isTask) throw new ClientError('Post is not task', 400)

      // Find task
      const task = await this._taskService.getTaskById(post.taskId)
      if (!task) throw new ClientError('Task not found', 404)

      // Add taskId and studentId to payload
      payload.taskId = post.taskId
      payload.studentId = user._id

      // Validate payload
      this._validator.validateCreateSubmission(payload)

      // Make sure no duplicate submission based on taskId and studentId
      const isDuplicateSubmission = await this._submissionService.checkDuplicateSubmission(payload.taskId, payload.studentId)
      if (isDuplicateSubmission) throw new ClientError('Duplicate submission', 400)

      // Create submission
      const submission = await this._submissionService.createSubmission(payload)

      // Add submissionId to task
      task.submissions.push(submission._id)
      await task.save()

      // Response
      const response = this._response.success(200, 'Add submission success!', { submission })

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getTaskSubmissions (req, res) {
    const token = req.headers.authorization
    const { classId, postId } = req.params

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Make sure user is TEACHER or ADMIN
      if (user.role === 'STUDENT') throw new ClientError('Unauthorized to get submissions', 401)

      // Find class
      const classData = await this._classService.getClass(classId)
      if (!classData) throw new ClientError('Class not found', 404)

      // Find post
      const post = await this._postService.getPostById(postId)
      if (!post) throw new ClientError('Post not found', 404)

      // Make sure post is task
      if (!post.isTask) throw new ClientError('Post is not task', 400)

      // Find task
      const task = await this._taskService.getTaskById(post.taskId)
      if (!task) throw new ClientError('Task not found', 404)

      // Find submissions
      const submissions = await this._taskService.getTaskSubmissions(task._id)

      // Response
      const response = this._response.success(200, 'Get task submissions success!', submissions)

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getTaskSubmission (req, res) {
    const token = req.headers.authorization
    const { classId, postId } = req.params

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Find class
      const classData = await this._classService.getClass(classId)
      if (!classData) throw new ClientError('Class not found', 404)

      // Find post
      const post = await this._postService.getPostById(postId)
      if (!post) throw new ClientError('Post not found', 404)

      // Make sure post is task
      if (!post.isTask) throw new ClientError('Post is not task', 400)

      // Find task
      const task = await this._taskService.getTaskById(post.taskId)
      if (!task) throw new ClientError('Task not found', 404)

      // Get submission detail
      const submission = await this._submissionService.getSubmissionDetail(task._id, user._id)

      // Response
      const response = this._response.success(200, 'Get submission detail success!', submission)

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async checkSubmissionStatus (req, res) {
    const token = req.headers.authorization
    const { classId, postId } = req.params

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Make sure user is STUDENT
      if (user.role !== 'STUDENT') throw new ClientError('Unauthorized to check submission status', 401)

      // Find class
      const classData = await this._classService.getClassStudents(classId)
      if (!classData) throw new ClientError('Class not found', 404)

      // Make sure student is in class
      let isStudentInClass = false
      for (const student of classData.students) {
        if (student._id.includes(user._id)) {
          isStudentInClass = true
          break
        }
      }
      if (!isStudentInClass) throw new ClientError('Unauthorized to check submission status in this class', 401)

      // Find post
      const post = await this._postService.getPostById(postId)
      if (!post) throw new ClientError('Post not found', 404)

      // Make sure post is task
      if (!post.isTask) throw new ClientError('Post is not task', 400)

      // Find task
      const task = await this._taskService.getTaskById(post.taskId)
      if (!task) throw new ClientError('Task not found', 404)

      // Find submission
      const isSubmitted = await this._submissionService.getSubmissionByTaskAndStudent(task._id, user._id)

      // Response
      const response = this._response.success(200, 'Check submission status success!', { isSubmitted })

      return res.status(response.statsCode || 200).json(response)
    } catch (error) {
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async updateSubmission (req, res) {
    const token = req.headers.authorization
    const { classId, postId } = req.params
    const payload = req.body

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Find class
      const classData = await this._classService.getClassStudents(classId)
      if (!classData) throw new ClientError('Class not found', 404)

      // Make sure student is in class
      let isStudentInClass = false
      for (const student of classData.students) {
        if (student._id.includes(user._id)) {
          isStudentInClass = true
          break
        }
      }
      if (!isStudentInClass) throw new ClientError('Unauthorized to update submission in this class', 401)

      // Find post
      const post = await this._postService.getPostById(postId)
      if (!post) throw new ClientError('Post not found', 404)

      // Make sure post is task
      if (!post.isTask) throw new ClientError('Post is not task', 400)

      // Find task
      const task = await this._taskService.getTaskById(post.taskId)
      if (!task) throw new ClientError('Task not found', 404)

      // Find submission
      const submission = await this._submissionService.getSubmissionByTaskAndStudentFull(task._id, user._id)
      if (!submission) throw new ClientError('Submission not found', 404)

      // Update submission
      const updatedSubmission = await this._submissionService.updateSubmission(submission._id, payload)

      // Response
      const response = this._response.success(200, 'Update submission success!', { submission: updatedSubmission })

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
