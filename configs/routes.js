module.exports.routes = {

  '/': {
    get: 'indexController.index',
  },

  '/register': {
    post: 'usersController.register',
  },

  '/login': {
    post: 'usersController.login',
  },

};