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

// Utils

// Controllers
const { AuthController } = require('./controllers')
const authController = new AuthController(userService)

// Routes
const { AuthRoutes } = require('./routes')
const authRoutes = new AuthRoutes(authController)

// Validator

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
