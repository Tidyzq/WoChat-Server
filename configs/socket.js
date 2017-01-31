module.exports.socket = {

  path: '/socket.io',

  handlers: {
    auth: 'SocketController.auth',
    message: 'SocketController.message',
    receive: 'SocketController.receive',
    ack: 'SocketController.ack',
  },

};