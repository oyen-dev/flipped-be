const { Attachment } = require('../models')

class AttachmentService {
  constructor () {
    this.name = 'AttachmentService'
  }

  async addAttachment (mimetype, url, name) {
    return await Attachment.create({ type: mimetype, url, name })
  }

  async updateAttachmentPostId (attachmentId, postId) {
    return await Attachment.findByIdAndUpdate(attachmentId, { postId })
  }
}

module.exports = {
  AttachmentService
}
