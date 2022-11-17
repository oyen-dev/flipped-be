const express = require('express')

class AttachmentRoutes {
  constructor (attachmentController) {
    this.router = express.Router()
    this._attachmentController = attachmentController

    this.router.post('/upload', this._attachmentController.uploadAttachment)
    this.router.post('/multiple', this._attachmentController.uploadMultipleAttachment)
    this.router.get('/:attachmentId', this._attachmentController.getAttachment)
  }
}

module.exports = {
  AttachmentRoutes
}
