const { ClientError } = require('../errors')

const getNeedRolesFunc = (responder) => (roles) => (req, res, next) => {
  const throwForbidden = () => {
    throw new ClientError('Forbidden', 403)
  }

  try {
    if (!req.user) throw new ClientError('Unauthorized', 401)

    const userRole = req.user.role.toLowerCase()

    if (typeof (roles) === 'string') {
      if (roles.toLowerCase() !== userRole) {
        throwForbidden()
      }
      next()
    } else if (Array.isArray(roles)) {
      for (const role of roles) {
        if (role.toLowerCase() === userRole) {
          next()
          return
        }
      }
      throwForbidden()
    } else {
      throwForbidden()
    }
  } catch (error) {
    console.log(error)
    responder.error(res, error)
  }
}

module.exports = {
  getNeedRolesFunc
}
