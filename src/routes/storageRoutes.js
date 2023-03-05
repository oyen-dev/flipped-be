const express = require('express')

class StorageRoutes {
  constructor (storageController) {
    this.router = express.Router()
    this._storageController = storageController

    this.router.get('/:attachmentId', this._storageController.getAttachment)
  }
}

module.exports = {
  StorageRoutes
}
