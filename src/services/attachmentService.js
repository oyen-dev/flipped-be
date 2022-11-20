const { Attachment } = require('../models')
const { ClientError } = require('../errors')

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

  async getAttachmentById (attachmentId) {
    const attachment = await Attachment.findById(attachmentId)

    if (!attachment) throw new ClientError('Attachment not found!', 404)

    return attachment
  }
}

module.exports = {
  AttachmentService
}
