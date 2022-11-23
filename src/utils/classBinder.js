const getAllFunctions = (object) => {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(object))
}

module.exports = {
  getAllFunctions
}
