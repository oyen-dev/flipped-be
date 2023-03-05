const cors = require('cors')
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
  ClassService,
  GradeService,
  OnlineUserService,
  LogService,
  AttachmentService,
  PostService,
  TaskService,
  SubmissionService,
  PresenceService,
  AnswerService,
  ESubmissionService,
  EvaluationService,
  QuestionService
} = require('./services')
const userService = new UserService()
const authService = new AuthService()
const mailService = new MailService()
const classService = new ClassService()
const gradeService = new GradeService()
const onlineUserService = new OnlineUserService()
const logService = new LogService()
const attachmentService = new AttachmentService()
const postService = new PostService()
const taskService = new TaskService()
const submissionService = new SubmissionService()
const presenceService = new PresenceService(classService)
const answerService = new AnswerService()
const eSubmissionService = new ESubmissionService()
const evaluationService = new EvaluationService()
const questionService = new QuestionService()

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
  PresenceController,
  EvaluationController,
  StorageController
} = require('./controllers')
const authController = new AuthController(authService, userService, mailService, validator, hashPassword, tokenize, response)
const userController = new UserController(userService, classService, authService, mailService, validator, hashPassword, tokenize, response)
const classController = new ClassController(classService, presenceService, taskService, evaluationService, userService, gradeService, validator, tokenize, response)
const socketController = new SocketController(onlineUserService, logService)
const attachmentController = new AttachmentController(attachmentService, userService, validator, tokenize, response)
const postController = new PostController(classService, userService, postService, taskService, submissionService, attachmentService, validator, tokenize, response)
const presenceController = new PresenceController(presenceService, classService, presenceValidator, tokenize, response)
const evaluationController = new EvaluationController(classService, userService, evaluationService, questionService, answerService, eSubmissionService, validator, tokenize, response)
const storageController = new StorageController()

// Routes
const { AuthRoutes, UserRoutes, ClassRoutes, AttachmentRoutes, PresenceRoutes, StorageRoutes } = require('./routes')
const authRoutes = new AuthRoutes(authController)
const userRoutes = new UserRoutes(userController)
const attachmentRoutes = new AttachmentRoutes(attachmentController)
const presenceRoutes = new PresenceRoutes(verifyToken, needRoles, presenceController)
const classRoutes = new ClassRoutes(classController, postController, presenceRoutes, evaluationController)
const storageRoutes = new StorageRoutes(storageController)

// Simple route
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Routes
app.use('/api/v1/auth', authRoutes.router)
app.use('/api/v1/users', userRoutes.router)
app.use('/api/v1/class', classRoutes.router)
app.use('/api/v1/attachment', attachmentRoutes.router)
app.use('/storage/uploads', storageRoutes.router)

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
