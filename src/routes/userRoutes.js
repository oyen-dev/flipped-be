const { MyRouter } = require('../myserver')

class UserRoutes {
  constructor (userController) {
    this.router = MyRouter()
    this._userController = userController

    // Universal
    this.router.get('/dashboard', this._userController.getDashboard)
    this.router.post('/picture', this._userController.editProfilePicture)
    this.router.get('/profile', this._userController.getUser)
    this.router.put('/profile', this._userController.editProfile)

    // Teacher
    this.router.get('/teachers', this._userController.getTeachers)
    this.router.get('/teachers/:id', this._userController.getTeacher)
    this.router.post('/teachers', this._userController.addTeacher)
    // this.router.put('/teachers/:id', this._userController.editTeacher)
    // this.router.delete('/teachers', this._userController.deleteTeacher)
    // this.router.post('/teachers/picture', this._userController.editProfilePicture)

    // Student
    this.router.get('/students', this._userController.getStudents)
    this.router.get('/students/:id', this._userController.getStudent)
    this.router.post('/students', this._userController.addStudent)
    // this.router.put('/students', this._userController.editStudent)
    // this.router.delete('/students', this._userController.deleteStudent)
    // this.router.post('/students/picture', this._userController.editProfilePicture)

    // Admin
    this.router.put('/students/:id', this._userController.adminEditProfile)
    this.router.put('/teachers/:id', this._userController.adminEditProfile)
    this.router.delete('/students/:id', this._userController.adminDeleteUser)
    this.router.delete('/teachers/:id', this._userController.adminDeleteUser)
    this.router.post('/students/:id', this._userController.adminRestoreUser)
    this.router.post('/teachers/:id', this._userController.adminRestoreUser)
    this.router.post('/students/picture/:id', this._userController.adminEditProfilePicture)
    this.router.post('/teachers/picture/:id', this._userController.adminEditProfilePicture)
  }
}

module.exports = {
  UserRoutes
}
