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

// Test db
// const { Token } = require('./models')

// const test = async () => {
//   const token = new Token({
//     email: 'test@test.com',
//     token: 'test',
//     expiresIn: '2022/10/15'
//   })

//   await token.save()
//   console.log(token)
// }

// test()
