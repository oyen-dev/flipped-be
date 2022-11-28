module.exports = {
  ...require('./handleError'),
  ...require('./verify-token'),
  ...require('./roleChecker')
}
