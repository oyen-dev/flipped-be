const toDateTimeString = (date) => {
  return new Date(date).toISOString().split('.')[0].replace('T', ' ')
}

module.exports = {
  toDateTimeString
}
