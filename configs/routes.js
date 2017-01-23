module.exports.routes = {

  '/': {
    get: 'indexController.index',
  },

  '/user': {
    get: ['indexController.test', 'usersController.index'],
  },

};