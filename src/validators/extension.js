const { ClientError } = require('../errors')

const validate = (payload, schema) => {
  const { error } = schema.validate(payload, { abortEarly: false })
  if (error) throw new ClientError(error.details, 400)
}

module.exports = {
  validate
}
