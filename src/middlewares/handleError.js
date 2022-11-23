const handleError = async (err, req, res, next) => {
  const { statusCode, message = 'An error occured' } = err
  const msg = message.replace(/['"]+/g, '')

  res.status(statusCode).json({
    status: false,
    message: msg,
    statusCode
  })
}

module.exports = {
  handleError
}
