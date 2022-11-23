const { getAllFunctions } = require('../../src/utils/classBinder')

describe('ClassBinder', () => {
  class SampleClass {
    constructor () {
      this.rateCount = 200
    }

    getCounter () {
      return this.rateCount
    }
  }

  describe('getAllFunctions', () => {
    it('returns all functions name in a class', () => {
      const functions = getAllFunctions(SampleClass)
      expect(functions).toEqual(['constructor', 'getCounter'])
    })
  })
})
