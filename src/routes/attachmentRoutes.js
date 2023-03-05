const express = require('express')
const { upload } = require('../services/localStorageService')

class AttachmentRoutes {
  constructor (attachmentController) {
    this.router = express.Router()
    this._attachmentController = attachmentController

    this.router.post('/upload', upload.single('files'), this._attachmentController.uploadAttachment)
    this.router.post('/multiple', upload.array('files', 10), this._attachmentController.uploadMultipleAttachment)
    this.router.get('/:attachmentId', this._attachmentController.getAttachment)
  }
}

module.exports = {
  AttachmentRoutes
}
