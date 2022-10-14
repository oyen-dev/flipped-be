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
const { UserService } = require('./services')
const userService = new UserService()

// Validator
const { Validator } = require('./validators')
const validator = new Validator()

// Utils
const { Response, HashPassword } = require('./utils')
const response = new Response()
const hashPassword = new HashPassword()

// Controllers
const { AuthController } = require('./controllers')
const authController = new AuthController(userService, validator, hashPassword, response)

// Routes
const { AuthRoutes } = require('./routes')
const authRoutes = new AuthRoutes(authController)

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

// Listen to port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
