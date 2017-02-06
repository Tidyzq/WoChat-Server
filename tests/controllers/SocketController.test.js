var assert = require('assert'),
    io = require('socket.io-client'),
    _ = require('lodash');

describe.only('SocketController', function () {

  var user1 = {
    username: 'testsocketuser1',
    nickname: 'testsocketuser1',
    password: '123456',
  };
  var user2 = {
    username: 'testsocketuser2',
    nickname: 'testsocketuser2',
    password: '123456',
  };

  var socketUrl = 'http://localhost:1337';

  var register = function (user) {
    return agent.post('/api/auth/register')
      .send(user)
      .expect(200)
      .expect(function (res) {
        assert.equal(res.body.username, user.username);
        assert.ifError(res.body.password);
        _.merge(user, res.body);
      });
  };

  var login = function (user) {
    return agent.post('/api/auth/login')
      .send({
        username: user.username,
        password: user.password,
      })
      .expect(200)
      .expect(function (res) {
        assert.equal(res.body.user.username, user.username);
        assert(res.body.accessToken);
        assert(res.body.refreshToken);
        _.merge(user, {
          accessToken: res.body.accessToken,
          refreshToken: res.body.refreshToken,
        });
      });
  };


  before(function () {
    return Promise.props({
      user1: register(user1),
      user2: register(user2),
    });
  });

  beforeEach(function () {
    return Promise.props({
      user1: login(user1),
      user2: login(user2),
    });
  });

  var connect = function () {
    return new Promise(function (resolve, reject) {
      var socket = io.connect(socketUrl);
      socket.on('connect', function () {
        resolve(socket);
      });
    });
  };

  it('should able to connect', function () {
    return connect()
      .then(function (connection) {
        connection.disconnect();
      });
  });

  describe('auth', function () {

    var auth = function (connection, user) {
      return new Promise(function (resolve, reject) {
        connection.on('auth:success', function (data) {
          assert.equal(data, user._id);
          resolve(connection);
        });
        connection.emit('auth', user.accessToken);
      });
    };

    var connection;

    beforeEach(function () {
      return Promise.props({
          user1: connect(),
          user2: connect(),
        })
        .then(function (conn) {
          connection = conn;
        });
    });

    it('should able to auth', function () {
        return Promise.props({
          user1: auth(connection.user1, user1),
          user2: auth(connection.user2, user2),
        });
    });
  });

});