const { Storage } = require('@google-cloud/storage')
const path = require('path')

const PROJECT_ID = process.env.PROJECT_ID

const storage = new Storage({
  keyFilename: path.join(__dirname, './keys.json'),
  projectId: PROJECT_ID
})

module.exports = {
  storage
}
