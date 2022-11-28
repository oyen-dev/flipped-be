const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

module.exports.connectDatabase = async () => {
  mongod = await MongoMemoryServer.create()

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  await mongoose.connect(mongod.getUri(), mongooseOpts)
}

module.exports.disconnectDatabase = async () => {
  await mongoose.connection.close()
  await mongod.stop()
}

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}
