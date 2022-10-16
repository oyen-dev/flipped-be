const { Storage } = require('@google-cloud/storage')
const path = require('path')

const storage = new Storage({
  keyFilename: path.join(__dirname, './keys.json'),
  projectId: 'flipped-learn'
})

module.exports = {
  storage
}
