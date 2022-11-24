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

  async deleteFile (fileName) {
    // delete file from gcp
    return new Promise((resolve, reject) => {
      if (!fileName) reject(new ClientError('File name is required', 400))

      const blob = bucket.file(fileName)

      blob.delete((err) => {
        if (err) {
          console.log(err)
        } else {
          resolve()
        }
      })
    })
  }
}

module.exports = {
  StorageService
}
