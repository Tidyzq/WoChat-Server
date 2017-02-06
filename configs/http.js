module.exports.http = {

  middlewares: [
    'logger',
    'response',
    'cookieParser',
    'bodyParser',
    'passport',
    'powerdBy',
    // 'favicon',
    'static',
    'httpRouter',
    '404',
    '500',
  ],

  routes: {
    '/': {
      get: 'IndexController.index',
    },

    '/api': {
      '/auth': {
        '/register': {
          post: 'AuthController.register',
        },
        '/login': {
          post: 'AuthController.login',
        },
        '/refresh': {
          post: 'AuthController.refresh'
        },
      },
      '/users': {
        '/:id': {
          get: ['AuthController.hasAccessToken', 'UserController.findUser'],
          put: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.update'],
          '/avatar': {
            post: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.uploadAvatar'],
          },
          '/contacts': {
            get: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.getContacts'],
            post: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.addContact'],
            '/count': {
              get: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.countContacts'],
            },
            '/:cid': {
              get: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.getContact'],
              put: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.updateContact'],
              delete: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.deleteContact'],
            },
          },
          // '/messages': {
          //   get: ['AuthController.hasJwt', 'UserController.isSelf', 'MessageController.receive'],
          // },
        },
      },
      // '/messages': {
      //   get: ['AuthController.hasJwt', 'MessageController.receive'],
      //   post: ['AuthController.hasJwt', 'MessageController.send'],
      // },
    },
  },

};