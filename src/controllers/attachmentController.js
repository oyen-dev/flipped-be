const { ClientError } = require('../errors')

class AttachmentController {
  constructor (attachmentService, storageService, userService, validator, tokenize, response) {
    this.name = 'AttachmentController'
    this._attachmentService = attachmentService
    this._storageService = storageService
    this._userService = userService
    this._validator = validator
    this._tokenize = tokenize
    this._response = response

    this.uploadAttachment = this.uploadAttachment.bind(this)
    this.uploadMultipleAttachment = this.uploadMultipleAttachment.bind(this)
  }

  async uploadAttachment (req, res) {
    const token = req.headers.authorization
    const file = req.files[0]

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Check file is exists
      if (!file) throw new ClientError('Please upload your attachment file!', 400)

      // Validate mime type and file size
      const { mimetype, size } = file
      this._validator.validateUploadAttachment({ mimetype, size })

      // Upload file to cloud storage
      const attachmentUrl = await this._storageService.uploadAttachment(file)

      // Save uri to db
      const attachment = await this._attachmentService.addAttachment(mimetype, attachmentUrl)

      // Array of attachment
      const attachments = [attachment]

      // Send response
      const response = this._response.success(200, 'Upload attachment success!', { attachments })

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }

  async uploadMultipleAttachment (req, res) {
    const token = req.headers.authorization
    const files = req.files

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Check file is exists
      if (!files) throw new ClientError('Please upload your attachment file!', 400)

      // Array of attachment
      const attachments = []

      // Looping file
      for (const f of files) {
        // Validate mime type and file size
        const { mimetype, size } = f
        this._validator.validateUploadAttachment({ mimetype, size })

        // Upload file to cloud storage
        const attachmentUrl = await this._storageService.uploadAttachment(f)

        // Save uri to db
        const attachment = await this._attachmentService.addAttachment(mimetype, attachmentUrl)

        // Push to array
        attachments.push(attachment)
      }

      // Send response
      const response = this._response.success(200, 'Upload multiple attachment success!', { attachments })

      return res.status(response.statusCode || 200).json(response)
    } catch (error) {
      // To do logger error
      console.log(error)
      return this._response.error(res, error)
    }
  }
}

module.exports = {
  AttachmentController
}
