module.exports.routes = {

  /**
   * param router
   */
  'id': {
    param: 'IndexController.processId'
  },

  /**
   * api router
   */

  '/': {
    get: 'IndexController.index',
  },

  '/api/users/register': {
    post: 'UserController.register',
  },

  '/api/users/login': {
    post: 'UserController.login',
  },

  '/api/users/:id': {
    get: ['AuthController.hasJwt', 'UserController.findOne'],
  },

};