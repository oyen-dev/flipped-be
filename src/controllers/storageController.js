const path = require('path')

class StorageController {
  constructor () {
    this.name = 'StorageController'

    this.getAttachment = this.getAttachment.bind(this)
  }

  async getAttachment (req, res) {
    const { attachmentId } = req.params

    const options = {
      root: path.join(__dirname, '../uploads')
    }

    return res.sendFile(attachmentId, options, (err) => {
      if (err) {
        console.error(err)
        res.status(404).end()
      }
    })
  }
}

module.exports = {
  StorageController
}
