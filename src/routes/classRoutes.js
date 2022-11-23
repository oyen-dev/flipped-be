const { MyRouter } = require('../myserver')

class ClassRoutes {
  constructor (classController) {
    this.name = 'ClassRouter'
    this.router = MyRouter()
    this._classController = classController

    this.router.get('/class', this._classController.getClasses)
    this.router.get('/class/:id', this._classController.getClass)
    this.router.post('/class', this._classController.addClass)
    this.router.post('/class/archive', this._classController.archiveClass)
    this.router.post('/class/delete', this._classController.deleteClass)
  }
}

module.exports = {
  ClassRoutes
}
