const { ClientError } = require('../errors')
const { bindAll } = require('../utils/classBinder')
const { validateFileTypes, deleteFile } = require('../services/localStorageService')

class AttachmentController {
  constructor (attachmentService, storageService, userService, validator, tokenize, response) {
    this.name = 'AttachmentController'
    this._attachmentService = attachmentService
    this._storageService = storageService
    this._userService = userService
    this._validator = validator
    this._tokenize = tokenize
    this._response = response

    bindAll(this)
  }

  async uploadAttachment (req, res) {
    const token = req.headers.authorization
    const file = req.file

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

      // First validate file type
      const validateResult = validateFileTypes(file)
      if (!validateResult) deleteFile(file)

      // Validate mime type and file size
      const { mimetype, originalname, size } = file
      this._validator.validateUploadAttachment({ mimetype, size })

      // Get fileName
      const fileName = `${process.env.BACKEND_URL}/storage/uploads/files${file.path.split('files')[1]}`

      // Save uri to db
      const attachment = await this._attachmentService.addAttachment(mimetype, fileName, originalname)

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

      // First looping to validate file type
      for (const f of files) {
        // First validate file type
        const validateResult = validateFileTypes(f)
        if (!validateResult) deleteFile(f)
      }

      // Looping file
      for (const f of files) {
        // Validate mime type and file size
        const { mimetype, originalname, size } = f
        this._validator.validateUploadAttachment({ mimetype, size })

        // Get fileName
        const fileName = `${process.env.BACKEND_URL}/storage/uploads/files${f.path.split('files')[1]}`

        // Save uri to db
        const attachment = await this._attachmentService.addAttachment(mimetype, fileName, originalname)

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

  async getAttachment (req, res) {
    const token = req.headers.authorization
    const { attachmentId } = req.params

    try {
      // Check token is exist
      if (!token) throw new ClientError('Unauthorized', 401)

      // Validate token
      const { _id } = await this._tokenize.verify(token)

      // Find user
      const user = await this._userService.findUserById(_id)
      if (!user) throw new ClientError('Unauthorized', 401)

      // Validate payload
      this._validator.validateGetAttachment({ attachmentId })

      // Get attachment
      const attachment = await this._attachmentService.getAttachmentById(attachmentId)

      // Response
      const response = this._response.success(200, 'Get attachment success!', { attachment })

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
