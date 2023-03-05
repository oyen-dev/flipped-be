const multer = require('multer')
const path = require('path')

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 25
  }
})

module.exports = {
  upload
}
