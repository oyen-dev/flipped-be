require('dotenv').config()
const cors = require('cors')
const multer = require('multer')
const express = require('express')
const mongoose = require('mongoose')
const { MyServer } = require('./myserver')

// Init express
const app = MyServer()

// Init body-parser
app.use(express.json())

// Use cors
app.use(cors())

// Services
const { UserService, AuthService, MailService, StorageService, ClassService, GradeService } = require('./services')
const userService = new UserService()
const authService = new AuthService()
const mailService = new MailService()
const storageService = new StorageService()
const classService = new ClassService()
const gradeService = new GradeService()

// Validator
const { Validator } = require('./validators')
const validator = new Validator()

// Utils
const { Response, HashPassword, Tokenize } = require('./utils')
const response = new Response()
const hashPassword = new HashPassword()
const tokenize = new Tokenize()

// Controllers
const { AuthController, UserController, ClassController } = require('./controllers')
const authController = new AuthController(authService, userService, mailService, validator, hashPassword, tokenize, response)
const userController = new UserController(userService, authService, storageService, mailService, validator, hashPassword, tokenize, response)
const classController = new ClassController(classService, userService, gradeService, storageService, validator, tokenize, response)

// Routes
const { AuthRoutes, UserRoutes, ClassRoutes } = require('./routes')
const authRoutes = new AuthRoutes(authController)
const userRoutes = new UserRoutes(userController)
const classRoutes = new ClassRoutes(classController)

// Multer middleware
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 10mb
  }
})

// Connect to mongodb
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewURLParser: true,
    useUnifiedTopology: true
  }).then(console.log('connected to db')).catch((err) => console.log(err))
}

// Use multer middleware single file
app.use(multerMid.array('files', 10))

// Catch error when file is too large
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const payload = response.fail(400, 'File is too large, max size is 10mb')

    return res.status(400).json(payload)
  }
})

// Simple route
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Routes
app.use('/api/v1/auth', authRoutes.router)
app.use('/api/v1/users', userRoutes.router)
app.use('/api/v1', classRoutes.router)

// Middlewares
const { handleError } = require('./middlewares')
app.use(handleError)

// Listen to port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = {
  app
}
