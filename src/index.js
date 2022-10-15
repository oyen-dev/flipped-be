require('dotenv').config()
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

// Init express
const app = express()

// Init body-parser
app.use(express.json())

// Use cors
app.use(cors())

// Services
const { UserService, AuthService, MailService } = require('./services')
const userService = new UserService()
const authService = new AuthService()
const mailService = new MailService()

// Validator
const { Validator } = require('./validators')
const validator = new Validator()

// Utils
const { Response, HashPassword, Tokenize } = require('./utils')
const response = new Response()
const hashPassword = new HashPassword()
const tokenize = new Tokenize()

// Controllers
const { AuthController, UserController } = require('./controllers')
const authController = new AuthController(authService, userService, mailService, validator, hashPassword, tokenize, response)
const userController = new UserController(userService, mailService, validator, hashPassword, tokenize, response)

// Routes
const { AuthRoutes, UserRoutes } = require('./routes')
const authRoutes = new AuthRoutes(authController)
const userRoutes = new UserRoutes(userController)

// Connect to mongodb
mongoose.connect(process.env.DATABASE_URL, {
  useNewURLParser: true,
  useUnifiedTopology: true
}).then(console.log('connected to db')).catch((err) => console.log(err))

// Simple route
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Routes
app.use('/api/v1/auth', authRoutes.router)
app.use('/api/v1/users', userRoutes.router)

// Listen to port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
