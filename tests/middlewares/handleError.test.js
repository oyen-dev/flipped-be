const request = require('supertest')
const { DocumentNotFoundError } = require('../../src/errors')
const { User } = require('../../src/models')
const { handleError } = require('../../src/middlewares')
const { MyServer } = require('../../src/myserver')

const getThrowerHandler = (err) => async (req, res, next) => {
  throw err
}

describe('handleError', () => {
  const documentNotFound = new DocumentNotFoundError(User, '121')
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
})
