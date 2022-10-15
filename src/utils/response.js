class Response {
  constructor () {
    this.name = 'response'
    this.success = this.success.bind(this)
    this.fail = this.fail.bind(this)
    this.error = this.error.bind(this)
  }

  success (statusCode, message, data, meta) {
    if (meta) {
      return {
        status: true,
        message,
        meta,
        data,
        statusCode
      }
    } else if (data) {
      return {
        status: true,
        message,
        data,
        statusCode
      }
    } else {
      return {
        status: true,
        message,
        statusCode
      }
    }
  }

  fail (statusCode, message) {
    return {
      status: false,
      message,
      statusCode
    }
  }

  error (res, error) {
    const { statusCode, message } = error
    const msg = message.replace(/['"]+/g, '')

    return res.status(statusCode).json(this.fail(statusCode, msg))
  }
}

module.exports = {
  Response
}
