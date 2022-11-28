module.exports = {
  ...require('./authRoutes'),
  ...require('./userRoutes'),
  ...require('./classRoutes'),
  ...require('./attachmentRoutes'),
  ...require('./presenceRoutes')
}
