const cleanStringify = (object) => JSON.stringify(object).replace(/\\/g, '')

module.exports = {
  cleanStringify
}
