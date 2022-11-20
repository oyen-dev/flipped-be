const { ClientError } = require('../errors')

class UserController {
  constructor (userService, classService, authService, storageService, mailService, validator, hashPassword, tokenize, response) {
    this.name = 'userController'
    this._userService = userService
    this._classService = classService
    this._authService = authService
    this._storageService = storageService
    this._mailService = mailService
    this._validator = validator
    this._hashPassword = hashPassword
    this._tokenize = tokenize
    this._response = response

    this.getUser = this.getUser.bind(this)
    this.getDashboard = this.getDashboard.bind(this)
    this.editProfile = this.editProfile.bind(this)

    this.addTeacher = this.addTeacher.bind(this)
    this.deleteTeacher = this.deleteTeacher.bind(this)
    this.getTeachers = this.getTeachers.bind(this)
    this.getTeacher = this.getTeacher.bind(this)

    this.addStudent = this.addStudent.bind(this)
    this.editStudent = this.editStudent.bind(this)
    this.deleteStudent = this.deleteStudent.bind(this)
    this.getStudents = this.getStudents.bind(this)
    this.getStudent = this.getStudent.bind(this)

    this.editProfilePicture = this.editProfilePicture.bind(this)

    this.adminEditProfile = this.adminEditProfile.bind(this)
    this.adminEditProfilePicture = this.adminEditProfilePicture.bind(this)
    this.adminDeleteUser = this.adminDeleteUser.bind(this)
    this.adminRestoreUser = this.adminRestoreUser.bind(this)
  }

  async getUser (req, res) {
    const token = req.headers.authorization

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetUser({ id: _id })

      // Get teacher
      const user = await this._userService.getUser(_id)

      // To do get enrolled class list

      // Send response
      const response = this._response.success(200, 'Get user success!', user)

      return res.status(200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async editProfile (req, res) {
    const token = req.headers.authorization
    const payload = req.body

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateEditUser({ id: _id, ...payload })

      // Update teacher
      await this._userService.updateUserProfile(_id, payload)

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Edit profile success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async addTeacher (req, res) {
    const token = req.headers.authorization
    const payload = req.body
    const { email } = payload

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateAddUser(payload)

      // Check if email was registered
      let user = await this._userService.findUserByEmail(email)
      if (user) throw new ClientError('Sorry, this email was registered.', 400)

      // Create new teacher
      user = await this._userService.directCreateUser(payload, 'TEACHER')

      // Generate token
      const tokenDetails = await this._authService.createToken(user)

      // Send email
      const url = process.env.CLIENT_URL || 'http://localhost:3000'
      const message = {
        name: user.fullName,
        email,
        link: `${url}/auth/reset-password?token=${tokenDetails.token}`
      }
      await this._mailService.sendEmail(message, 'Selamat Datang di Online Learning', 'setpassword')

      // Send response
      const response = this._response.success(201, 'Add teacher success, please check email to set password!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async deleteTeacher (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateDeleteUser({ id })

      // Delete teacher
      await this._userService.deleteUser(id, 'Teacher')

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Delete teacher success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getTeachers (req, res) {
    const token = req.headers.authorization
    const payload = req.query
    const { q, page, limit, deleted } = payload

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetUsers(payload)

      // Get teachers
      const teachers = await this._userService.getUsers('TEACHER', q, page, limit, deleted)
      const { users, count } = teachers
      const meta = {
        count,
        limit,
        page,
        totalPages: Math.ceil(count / limit)
      }

      // Send response
      const response = this._response.success(200, 'Get teachers success!', { teachers: users }, meta)

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getTeacher (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetUser({ id })

      // Get teacher
      const user = await this._userService.getUser(id)

      // To do get enrolled class list

      // Send response
      const response = this._response.success(200, 'Get teacher success!', user)

      return res.status(200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async addStudent (req, res) {
    const token = req.headers.authorization
    const payload = req.body
    const { email } = payload

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateAddUser(payload)

      // Check if email was registered
      let user = await this._userService.findUserByEmail(email)
      if (user) throw new ClientError('Sorry, this email was registered.', 400)

      // Create new teacher
      user = await this._userService.directCreateUser(payload, 'STUDENT')

      // Generate token
      const tokenDetails = await this._authService.createToken(user)

      // Send email
      const url = process.env.CLIENT_URL || 'http://localhost:3000'
      const message = {
        name: user.fullName,
        email,
        link: `${url}/auth/reset-password?token=${tokenDetails.token}`
      }
      await this._mailService.sendEmail(message, 'Selamat Datang di Online Learning', 'studentsetpassword')

      // Send response
      const response = this._response.success(201, 'Add student success, please check email to set password!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async editStudent (req, res) {
    const token = req.headers.authorization
    const payload = req.body

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateEditUser({ id: _id, ...payload })

      // Update student
      await this._userService.updateUserProfile(_id, payload)

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Edit student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async deleteStudent (req, res) {
    const token = req.headers.authorization

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateDeleteUser({ id: _id })

      // Delete teacher
      await this._userService.deleteUser(_id)

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Delete student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getStudents (req, res) {
    const token = req.headers.authorization
    const payload = req.query
    const { q, page, limit, deleted } = payload

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetUsers(payload)

      // Get students
      const students = await this._userService.getUsers('STUDENT', q, page, limit, deleted)
      const { users, count } = students
      const meta = {
        count,
        limit,
        page,
        totalPages: Math.ceil(count / limit)
      }

      // Send response
      const response = this._response.success(200, 'Get students success!', { students: users }, meta)

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getStudent (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      await this._tokenize.verify(token)

      // Validate payload
      this._validator.validateGetUser({ id })

      // Get teacher
      const user = await this._userService.getUser(id)

      // To do get enrolled class list

      // Send response
      const response = this._response.success(200, 'Get student success!', user)

      return res.status(200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async editProfilePicture (req, res) {
    const token = req.headers.authorization
    const file = req.files[0]

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Check file is exists
      if (!file) throw new ClientError('Please upload your picture file!', 400)

      // Validate mime type and file size
      const { mimetype, size } = file
      this._validator.validateEditPicture({ mimetype, size })

      // Upload file to cloud storage
      const imageUrl = await this._storageService.uploadImage(file)

      // Update user profile picture
      user.picture = imageUrl
      user.updatedAt = new Date()
      await user.save()

      // Send response
      const response = this._response.success(200, 'Edit profile picture success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async adminEditProfilePicture (req, res) {
    const token = req.headers.authorization
    const id = req.params.id
    const file = req.files[0]

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Make sure token is ADMIN
      let user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)
      if (user.role !== 'ADMIN') throw new ClientError('Unauthorized', 401)

      // Find user
      user = await this._userService.findUserById(id)
      if (!user) throw new ClientError('Invalid id', 404)

      // Check file is exists
      if (!file) throw new ClientError('Please upload your picture file!', 400)

      // Validate mime type and file size
      const { mimetype, size } = file
      this._validator.validateEditPicture({ mimetype, size })

      // Upload file to cloud storage
      const imageUrl = await this._storageService.uploadImage(file)

      // Update user profile picture
      user.picture = imageUrl
      user.updatedAt = new Date()
      await user.save()

      // Send response
      const response = this._response.success(200, 'Edit profile picture success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async adminEditProfile (req, res) {
    const token = req.headers.authorization
    const payload = req.body
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Make sure token is ADMIN
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)
      if (user.role !== 'ADMIN') throw new ClientError('Unauthorized', 401)

      // Validate payload
      this._validator.validateEditUser({ id, ...payload })

      // Update student
      await this._userService.updateUserProfile(id, payload, 'Student')

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Edit student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async adminDeleteUser (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Make sure token is ADMIN
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)
      if (user.role !== 'ADMIN') throw new ClientError('Unauthorized', 401)

      // Validate payload
      this._validator.validateDeleteUser({ id })

      // Delete teacher
      await this._userService.deleteUser(id)

      // Send email for notify

      // Send response
      const response = this._response.success(200, 'Delete student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async adminRestoreUser (req, res) {
    const token = req.headers.authorization
    const id = req.params.id

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Make sure token is ADMIN
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)
      if (user.role !== 'ADMIN') throw new ClientError('Unauthorized', 401)

      // Validate payload
      this._validator.validateDeleteUser({ id })

      // Delete teacher
      await this._userService.restoreUser(id)

      // Send response
      const response = this._response.success(200, 'Delete student success!')

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async getDashboard (req, res) {
    const token = req.headers.authorization

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Make sure token is ADMIN
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Get user logs data
      const recent = await this._userService.getLogs(_id)

      // Get statistic
      const statistic = await this._userService.getStatistic()

      // Get recent class
      const classes = await this._classService.getDashboardClass(user._id, user.role)

      // Response
      const response = this._response.success(200, 'Get dashboard success!', {
        recent,
        statistic,
        classes
      })

      // Send response
      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  UserController
}
