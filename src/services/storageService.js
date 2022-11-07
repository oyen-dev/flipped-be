/* eslint-disable prefer-promise-reject-errors */
const { ClientError } = require('../errors')
const { storage } = require('../config')
const bucket = storage.bucket('flipped-storage')

class StorageService {
  constructor () {
    this.name = 'storageService'
  }

  uploadImage (file) {
    // upload file to gcp
    return new Promise((resolve, reject) => {
      if (!file) reject(new ClientError('File is required', 400))

      // Format name file tp avoid space
      const newFileName = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`

      const blob = bucket.file(newFileName)
      const blobStream = blob.createWriteStream({
        resumable: false
      })

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/flipped-storage/${blob.name}`
        resolve(publicUrl)
      }).on('error', (err) => {
        console.log(err)
        reject(new ClientError('Unable to upload image, something wrong', 500))
      }).end(file.buffer)
    })
  }

  uploadAttachment (file) {
    // upload file to gcp
    return new Promise((resolve, reject) => {
      if (!file) reject(new ClientError('File is required', 400))

      // Format name file tp avoid space
      const newFileName = `${Date.now()}-attachment-${file.originalname.replace(/\s/g, '')}`

      const blob = bucket.file(newFileName)
      const blobStream = blob.createWriteStream({
        resumable: false
      })

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/flipped-storage/${blob.name}`
        resolve(publicUrl)
      }).on('error', (err) => {
        console.log(err)
        reject(new ClientError('Unable to upload attachment, something wrong', 500))
      }).end(file.buffer)
    })
  }
}

module.exports = {
  StorageService
}
