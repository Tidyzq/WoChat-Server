module.exports.routes = {

  '/': {
    get: 'IndexController.index',
  },

  '/api': {
    '/users': {
      'id': {
        param: 'IndexController.processId',
      },
      '/register': {
        post: 'UserController.register',
      },
      '/login': {
        post: 'UserController.login',
      },
      '/:id': {
        get: ['AuthController.hasJwt', 'UserController.findOne'],
      },
    },
  },


};