module.exports.socket = {

  path: '/socket.io',

  middlewares: [
    'socketRouter',
  ],

  routes: {

    auth: 'SocketController.auth',

    message: ['SocketController.isAuthed', 'SocketController.message'],

    receive: ['SocketController.isAuthed', 'SocketController.receive'],

    ack: ['SocketController.isAuthed', 'SocketController.ack'],

  },

};