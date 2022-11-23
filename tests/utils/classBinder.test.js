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

  class AnotherClass {
    constructor () {
      this.rateCount = 500
    }

    fetchCounter () {
      return this.rateCount
    }
  }

  describe('getAllFunctions', () => {
    it('returns all functions name in a class', () => {
      const sampleObj = new SampleClass()
      const functions = getAllFunctions(sampleObj)
      expect(functions).toEqual(['constructor', 'getCounter'])
    })

    it('returns all functions name in another class', () => {
      const anotherObj = new AnotherClass()
      const functions = getAllFunctions(anotherObj)
      expect(functions).toEqual(['constructor', 'fetchCounter'])
    })
  })
})
