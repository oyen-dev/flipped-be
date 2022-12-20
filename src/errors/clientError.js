class ResponseError extends Error {
  constructor (message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.message = message
  }
}

class ClientError extends ResponseError {
  constructor (message, statusCode) {
    super(message, statusCode)
    this.statusCode = statusCode
    this.name = 'ClientError'
  }
}

class BadRequestError extends ResponseError {
  constructor (message = 'Unauthorized') {
    super(message, 400)
  }
}

class UnauthorizedError extends ResponseError {
  constructor (message = 'Unauthorized') {
    super(message, 401)
  }
}

class ForbiddenError extends ResponseError {
  constructor (message = 'Forbidden') {
    super(message, 403)
  }
}

class DocumentNotFoundError extends ResponseError {
  constructor (document, id) {
    let documentName
    if (typeof (document) === 'function') {
      documentName = document.name
    } else if (typeof (document) === 'object') {
      documentName = document.constructor.name
    } else if (typeof (document) === 'string') {
      documentName = document
    }

    let msg
    if (id) {
      msg = `${documentName} with id ${id} is not found.`
    } else {
      msg = `${documentName} not found.`
    }

    super(
      msg,
      404
    )
  }
}

class ConflictError extends ResponseError {
  constructor (message = 'Conflict') {
    super(message, 409)
  }
}

class InternalServerError extends ResponseError {
  constructor (message) {
    super(message, 500)
  }
}

module.exports = {
  ResponseError,
  ClientError,
  UnauthorizedError,
  DocumentNotFoundError,
  InternalServerError,
  ForbiddenError,
  ConflictError,
  BadRequestError
}
