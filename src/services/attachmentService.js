const { Attachment } = require('../models')

class AttachmentService {
  constructor () {
    this.name = 'AttachmentService'
  }

  async addAttachment (mimetype, url) {
    return await Attachment.create({ type: mimetype, url })
  }
}

module.exports = {
  AttachmentService
}
