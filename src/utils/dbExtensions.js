const { Schema } = require('mongoose')

// Mongo schema with soft delete support
class MySchema extends Schema {
  constructor (definition, options) {
    super({
      ...definition,
      deletedAt: {
        type: Date,
        default: null,
        nullable: true
      }
    }, options)
  }
}

// Find documents and exclude soft deleted documents
const find = async (model, filters, sort) => {
  if (!filters) {
    filters = {}
  }
  const query = model.findOne({
    deletedAt: null,
    ...filters
  })

  if (sort) {
    query.sort(sort)
  }

  return await query
}

module.exports = {
  MySchema,
  find
}
