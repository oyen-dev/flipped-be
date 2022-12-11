const multer = require('multer')
const { ResponseError, BadRequestError } = require('../errors')
const { ValidationError } = require('joi')

const getErrorPayload = (statusCode, message) => ({
  status: false,
  message,
  statusCode
})

const handleResponseError = (err, res) => {
  const { statusCode, message = 'An error occured' } = err

  let msg
  if (typeof (message) === 'string') { msg = message.replace(/['"]+/g, '') } else {
    msg = message
  }
  res.status(statusCode).json(getErrorPayload(statusCode, msg))
}

const handleError = async (err, req, res, next) => {
  if (err instanceof ResponseError) {
    handleResponseError(err, res)
  } else if (err instanceof multer.MulterError) {
    // Catch error when file is too large
    res.status(400).json(getErrorPayload(400, 'File is too large, max size is 10mb'))
  } else if (err instanceof ValidationError) {
    handleResponseError(
      new BadRequestError(err.message),
      res
    )
  } else {
    res.status(500).json(getErrorPayload(500, err.message || ''))
  }
}

module.exports = {
  handleError
}
