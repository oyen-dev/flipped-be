const { getAllFunctions, bindAll } = require('../../src/utils/classBinder')

describe('ClassBinder', () => {
  describe('getAllFunctions', () => {
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

  describe('bindAll', () => {
    class SampleBindedClass {
      constructor () {
        this.rateCount = 200
        bindAll(this)
      }

      getCounter () {
        return this.rateCount
      }
    }

    class AnotherClass {
      constructor () {
        this.rateCount = 500
        bindAll(this)
      }

      fetchCounter () {
        return this.rateCount
      }
    }

    it('returns an object with binded functions', async () => {
      const sampleObj = new SampleBindedClass()
      expect(await sampleObj.getCounter()).toEqual(200)
    })

    it('returns another object with binded functions', async () => {
      const anotherObj = new AnotherClass()
      expect(await anotherObj.fetchCounter()).toEqual(500)
    })
  })
})
