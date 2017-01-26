module.exports.routes = {

  '/': {
    get: 'IndexController.index',
  },

  '/api': {
    '/users': {
      '/register': {
        post: 'UserController.register',
      },
      '/login': {
        post: 'UserController.login',
      },
      '/:id': {
        get: ['AuthController.hasJwt', 'UserController.findOne'],
        put: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.update'],
      },
      '/:id/contacts': {
        get: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.getContacts'],
      },
      '/:id/messages': {
        get: ['AuthController.hasJwt', 'UserController.isSelf', 'MessageController.receive'],
      }
    },
    '/messages': {
      get: ['AuthController.hasJwt', 'MessageController.receive'],
      post: ['AuthController.hasJwt', 'MessageController.send'],
    },
  },


};