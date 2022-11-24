const getAllFunctions = (object) => {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(object))
}

const bindAll = (self) => {
  for (const func of getAllFunctions(self)) {
    if (func === 'constructor') continue
    self[func] = self[func].bind(self)
  }
}

module.exports = {
  getAllFunctions,
  bindAll
}
