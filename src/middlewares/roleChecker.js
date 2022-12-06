const { UnauthorizedError, ForbiddenError } = require('../errors')

const needRole = (roles) => (req, _, next) => {
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

const getNeedRolesFunc = (responder) => needRole

module.exports = {
  getNeedRolesFunc,
  needRole
}
