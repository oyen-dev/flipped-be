require('dotenv').config()
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

// Init express
const app = express()

// Init body-parser
app.use(express.json())

// Init cors
app.use(cors())

// Connect to mongodb
mongoose.connect(process.env.DATABASE_URL, {
  useNewURLParser: true,
  useUnifiedTopology: true
}).then(console.log('connected to db')).catch((err) => console.log(err))

// Simple route
app.get('/', (req, res) => {
  res.send('Hello World')
})

// Listen to port
app.listen(3000, () => console.log('Server started'))
