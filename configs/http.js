module.exports.http = {

  accessControl: {
    allowOrigin: '*',
    allowHeaders: 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With',
    allowMethods: 'PUT,POST,GET,DELETE,OPTIONS',
  },

  middlewares: [
    'logger',
    'response',
    'accessControl',
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
        '/search': {
          get: 'UserController.search',
        },
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
          '/invitation': {
            post: ['AuthController.hasAccessToken', 'UserController.hasUser', 'UserController.sendInvitation'],
            '/accept': {
              post: ['AuthController.hasAccessToken', 'UserController.isSelf', 'UserController.acceptInvitation'],
            }
          }
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