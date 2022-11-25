const { UnauthorizedError, ForbiddenError } = require('../errors')

const getNeedRolesFunc = (responder) => (roles) => (req, res, next) => {
  if (!req.user) throw new UnauthorizedError()

  const userRole = req.user.role.toLowerCase()

  if (typeof (roles) === 'string') {
    if (roles.toLowerCase() !== userRole) {
      throw new ForbiddenError()
    }
    next()
  } else if (Array.isArray(roles)) {
    for (const role of roles) {
      if (role.toLowerCase() === userRole) {
        next()
        return
      }
    }
    throw new ForbiddenError()
  } else {
    throw new ForbiddenError()
  }
}

module.exports = {
  getNeedRolesFunc
}
