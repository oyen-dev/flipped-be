require('dotenv').config()

const mongoose = require('mongoose')
const { server } = require('./app')

// Connect to mongodb
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.DATABASE_URL, {
    useNewURLParser: true,
    useUnifiedTopology: true
  }).then(console.log('connected to db')).catch((err) => console.log(err))
}

// Listen to port
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
