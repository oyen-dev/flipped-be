const cors = require('cors')
const multer = require('multer')
const express = require('express')
const { MyServer } = require('./myserver')
const { Websocket } = require('./websocket')

// Init express
const app = MyServer()
const server = require('http').createServer(app)

// Init socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Init body-parser
app.use(express.json())

// Use cors
app.use(cors())

// Services
const {
  UserService,
  AuthService,
  MailService,
  StorageService,
  ClassService,
  GradeService,
  OnlineUserService,
  LogService,
  AttachmentService,
  PostService,
  TaskService,
  SubmissionService,
  PresenceService
} = require('./services')
const userService = new UserService()
const authService = new AuthService()
const mailService = new MailService()
const storageService = new StorageService()
const classService = new ClassService()
const gradeService = new GradeService()
const onlineUserService = new OnlineUserService()
const logService = new LogService()
const attachmentService = new AttachmentService()
const postService = new PostService()
const taskService = new TaskService()
const submissionService = new SubmissionService()
const presenceService = new PresenceService(classService)

// Validator
const { Validator, PresenceValidator } = require('./validators')
const validator = new Validator()
const presenceValidator = new PresenceValidator()

// Utils
const { Response, HashPassword, Tokenize } = require('./utils')
const response = new Response()
const hashPassword = new HashPassword()
const tokenize = new Tokenize()

// Middlewares
const { getTokenVerifier, getNeedRolesFunc } = require('./middlewares')
const verifyToken = getTokenVerifier(userService, tokenize, response)
const needRoles = getNeedRolesFunc(response)

// Controllers
const {
  AuthController,
  UserController,
  ClassController,
  SocketController,
  AttachmentController,
  PostController,
  PresenceController
} = require('./controllers')
const authController = new AuthController(authService, userService, mailService, validator, hashPassword, tokenize, response)
const userController = new UserController(userService, classService, authService, storageService, mailService, validator, hashPassword, tokenize, response)
const classController = new ClassController(classService, userService, gradeService, storageService, validator, tokenize, response)
const socketController = new SocketController(onlineUserService, logService)
const attachmentController = new AttachmentController(attachmentService, storageService, userService, validator, tokenize, response)
const postController = new PostController(classService, userService, postService, taskService, submissionService, attachmentService, storageService, validator, tokenize, response)
const presenceController = new PresenceController(presenceService, classService, presenceValidator, response)

// Routes
const { AuthRoutes, UserRoutes, ClassRoutes, AttachmentRoutes, PresenceRoutes } = require('./routes')
const authRoutes = new AuthRoutes(authController)
const userRoutes = new UserRoutes(userController)
const attachmentRoutes = new AttachmentRoutes(attachmentController)
const presenceRoutes = new PresenceRoutes(verifyToken, needRoles, presenceController)
const classRoutes = new ClassRoutes(classController, postController, presenceRoutes)

// Multer middleware
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // no larger than 25mb
  }
})

// Use multer middleware single file
app.use(multerMid.array('files', 10))

// Catch error when file is too large
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const payload = response.fail(400, 'File is too large, max size is 25mb')

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
app.use('/api/v1/class', classRoutes.router)
app.use('/api/v1/attachment', attachmentRoutes.router)

// Websocket connection
// eslint-disable-next-line no-unused-vars
const ws = new Websocket(io, socketController)

// Middlewares
const { handleError } = require('./middlewares')
app.use(handleError)

module.exports = {
  app,
  server
}
