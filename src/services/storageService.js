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

      const newFileName = `${Date.now()}-${file.originalname}`
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
}

module.exports = {
  StorageService
}

// return new Promise((resolve, reject) => {
//   const { originalname, buffer, mimetype } = file

//   console.log(bucket)
//   const blob = bucket.file(originalname)
//   const blobStream = blob.createWriteStream({
//     resumable: false
//   })

//   blobStream.on('finish', () => {
//     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
//     resolve(publicUrl)
//   }).on('error', () => {
//     reject(new ClientError('Unable to upload image, something wrong', 400))
//   }).end(buffer)
// })
