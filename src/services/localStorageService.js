const { ClientError } = require('../errors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

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

const deleteFile = (file) => {
  fs.unlink(file.path, (err) => {
    if (err) {
      throw new ClientError('Terjadi kesalahan saat menghapus file', 500)
    }
  })
}

const deleteUploadedFile = (fileName) => {
  fs.unlink(path.join(__dirname, `../uploads/${fileName}`), err => {
    if (err) {
      throw new ClientError('Terjadi kesalahan saat menghapus file', 500)
    }
  })
}

const acceptedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]

const validateFileTypes = (file) => {
  if (!acceptedFileTypes.includes(file.mimetype)) {
    return false
  }
  return true
}

module.exports = {
  upload,
  deleteFile,
  validateFileTypes,
  deleteUploadedFile
}
