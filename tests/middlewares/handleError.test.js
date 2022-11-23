const request = require('supertest')
const { DocumentNotFoundError, UnauthorizedError, InternalServerError } = require('../../src/errors')
const { User } = require('../../src/models')
const { handleError } = require('../../src/middlewares')
const { MyServer } = require('../../src/myserver')

const getThrowerHandler = (err) => async (req, res, next) => {
  throw err
}

describe('handleError', () => {
  const documentNotFound = new DocumentNotFoundError(User, '121')
  const unauthorized = new UnauthorizedError()
  const serverError = new InternalServerError('Database connection is fail')
  const customError = new Error('Failed to send email')

  const testError = async (path, error) => {
    const server = MyServer()
    server.get(path, getThrowerHandler(error))
    server.use(handleError)
    return await request(server)
      .get(path)
  }

  it('returns 404 when a DocumentNotFoundError thrown', async () => {
    const response = await testError('/testing-not-found-1', documentNotFound)
    expect(response.statusCode).toEqual(404)
  })

  it('returns document not found message', async () => {
    const response = await testError('/testing-not-found-2', documentNotFound)
    expect(response.body.message).toContain(' with id 121 is not found')
  })

  it('returns 401 when an UnauthorizedError thrown', async () => {
    const response = await testError('/testing-unauthorized-1', unauthorized)
    expect(response.statusCode).toBe(401)
  })

  it('returns message Unauthorized when an UnauthorizedError thrown', async () => {
    const response = await testError('/testing-unauthorized-2', unauthorized)
    expect(response.body.message).toContain('Unauthorized')
  })

  it('returns 500 when an InternalServerError thrown', async () => {
    const response = await testError('/testing-server-error-1', serverError)
    expect(response.statusCode).toBe(500)
  })

  it('returns valid message when an InternalServerError thrown', async () => {
    const response = await testError('/testing-server-error-1', serverError)
    expect(response.body.message).toBe('Database connection is fail')
  })

  it('returns 500 when unknown error type thrown', async () => {
    const response = await testError('/testing-custom-error-1', customError)
    expect(response.statusCode).toBe(500)
  })

  it('returns valid message when unknown error type thrown', async () => {
    const response = await testError('/testing-custom-error-2', customError)
    expect(response.body.message).toBe('Failed to send email')
  })
})
