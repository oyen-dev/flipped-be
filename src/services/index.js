module.exports = {
  ...require('./userService'),
  ...require('./authService'),
  ...require('./mailService'),
  ...require('./storageService'),
  ...require('./classService'),
  ...require('./gradeService'),
  ...require('./onlineUserService'),
  ...require('./logService'),
  ...require('./postService'),
  ...require('./attachmentService'),
  ...require('./taskService'),
  ...require('./submissionService')
}
