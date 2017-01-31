var jsonwebtoken = require('jsonwebtoken');

var SocketController = module.exports = {

  auth: function (client, token) {
    log.silly('SocketController::auth', token);
    token = token || '';
    jsonwebtoken.verify(token, app.get('passport').jwt.secret, function (err, decoded) {
      if (err) return client.emit('auth:fail', err);
      client.user = decoded.user;
      client.join(client.user);
      client.emit('auth:success', decoded.user);
      SocketController.receive(client);
    });
  },

  message: function (client, value) {
    if (!client.user) return client.emit('need auth');
    value = value || {};

    value.sender = client.user;
    var Message = app.models.Message;

    Message.create(value)
      .then(function (message) {
        client.emit('message:success', message.toObject());
        client.to(message.receiver.toString()).emit('message', [message]);
      })
      .catch(function (err) {
        client.emit('message:fail', err.message);
      });
  },

  receive: function (client) {
    if (!client.user) return client.emit('need auth');

    var Message = app.models.Message;

    Message.find({ receiver: client.user })
      .lean()
      .then(function (messages) {
        if (messages.length)
          client.emit('message', messages);
      });
  },

  ack: function (client, acks) {
    if (!client.user) return client.emit('need auth');
    acks = acks || [];

    var Message = app.models.Message;

    Message.remove({
      receiver: client.user,
      _id: { $in: acks }
    })
      .then(function (rst) {
        client.emit('ack:success', rst);
      })
      .catch(function (err) {
        client.emit('ack:fail', err.message);
      });
  },

};