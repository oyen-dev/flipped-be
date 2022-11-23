const { ResponseError } = require('../errors')

const handleError = async (err, req, res, next) => {
  if (err instanceof ResponseError) {
    const { statusCode, message = 'An error occured' } = err
    const msg = message.replace(/['"]+/g, '')

    res.status(statusCode).json({
      status: false,
      message: msg,
      statusCode
    })
  } else {
    res.status(500).json({
      status: false,
      message: err.message || '',
      statusCode: 500
    })
  }
}

module.exports = {
  handleError
}
