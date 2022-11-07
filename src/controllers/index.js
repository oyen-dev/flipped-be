module.exports = {
  ...require('./authController'),
  ...require('./userController'),
  ...require('./classController'),
  ...require('./socketController'),
  ...require('./attachmentController'),
  ...require('./postController')
}
