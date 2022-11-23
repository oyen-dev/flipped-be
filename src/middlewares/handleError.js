const multer = require('multer')
const { ResponseError } = require('../errors')

const getErrorPayload = (statusCode, message) => ({
  status: false,
  message,
  statusCode
})

const handleError = async (err, req, res, next) => {
  if (err instanceof ResponseError) {
    const { statusCode, message = 'An error occured' } = err
    const msg = message.replace(/['"]+/g, '')

    res.status(statusCode).json(getErrorPayload(statusCode, msg))
  } else if (err instanceof multer.MulterError) {
    // Catch error when file is too large
    res.status(400).json(getErrorPayload(400, 'File is too large, max size is 10mb'))
  } else {
    res.status(500).json(getErrorPayload(500, err.message || ''))
  }
}

module.exports = {
  handleError
}
