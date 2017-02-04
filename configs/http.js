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
        // '/:id': {
        //   get: ['AuthController.hasJwt', 'UserController.findOne'],
        //   put: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.update'],
        //   '/avatar': {
        //     post: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.uploadAvatar'],
        //   },
        //   '/contacts': {
        //     get: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.getContacts'],
        //     post: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.addContact'],
        //     '/count': {
        //       get: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.countContacts'],
        //     },
        //     '/:cid': {
        //       get: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.getContact'],
        //       put: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.updateContact'],
        //       delete: ['AuthController.hasJwt', 'UserController.isSelf', 'UserController.deleteContact'],
        //     },
        //   },
        //   '/messages': {
        //     get: ['AuthController.hasJwt', 'UserController.isSelf', 'MessageController.receive'],
        //   },
        // },
      },
      // '/messages': {
      //   get: ['AuthController.hasJwt', 'MessageController.receive'],
      //   post: ['AuthController.hasJwt', 'MessageController.send'],
      // },
    },
  },

};