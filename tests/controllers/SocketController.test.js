'use strict'

let assert = require('assert'),
    io = require('socket.io-client'),
    _ = require('lodash')

describe('SocketController', () => {

  let user1 = {
    username: 'testsocketuser1',
    nickname: 'testsocketuser1',
    password: '123456',
  }
  let user2 = {
    username: 'testsocketuser2',
    nickname: 'testsocketuser2',
    password: '123456',
  }

  const socketUrl = 'http://localhost:1337'

  let register = (user) => {
    return agent.post('/api/auth/register')
      .send(user)
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.username, user.username)
        assert.ifError(res.body.password)
        _.merge(user, res.body)
      })
  }

  let login = (user) => {
    return agent.post('/api/auth/login')
      .send({
        username: user.username,
        password: user.password,
      })
      .expect(200)
      .expect((res) => {
        assert.equal(res.body.user.username, user.username)
        assert(res.body.accessToken)
        assert(res.body.refreshToken)
        _.merge(user, {
          accessToken: res.body.accessToken,
          refreshToken: res.body.refreshToken,
        })
      })
  }


  before(() => {
    return Promise.props({
      user1: register(user1),
      user2: register(user2),
    })
  })

  beforeEach(() => {
    return Promise.props({
      user1: login(user1),
      user2: login(user2),
    })
  })

  let connect = () => {
    return new Promise((resolve, reject) => {
      let socket = io.connect(socketUrl)
      socket.on('connect', () => {
        resolve(socket)
      })
    })
  }

  it('should able to connect', () => {
    return connect()
      .then((connection) => {
        connection.disconnect()
      })
  })

  let auth = (connection, user) => {
    return new Promise((resolve, reject) => {
      connection.on('auth:success', (data) => {
        assert.equal(data, user._id)
        resolve(connection)
      })
      connection.emit('auth', user.accessToken)
    })
  }

  describe('auth', () => {

    var connections

    beforeEach(() => {
      return Promise.props({
          user1: connect(),
          user2: connect(),
        })
        .then((conn) => {
          connections = conn
        })
    })

    it('should able to auth', () => {
        return Promise.props({
          user1: auth(connections.user1, user1),
          user2: auth(connections.user2, user2),
        })
    })
  })

  describe('message', () => {

    var connections

    before(() => {
      return agent.post('/api/users/' + user1._id + '/contacts')
        .set('Authorization', 'JWT ' + user1.accessToken)
        .send({
          contact: user2._id
        })
        .expect(201)
        .then(() => {
          return agent.post('/api/users/' + user2._id + '/contacts')
            .set('Authorization', 'JWT ' + user2.accessToken)
            .send({
              contact: user1._id
            })
            .expect(201)
        })
    })

    beforeEach(() => {
      return Promise.props({
          user1: connect(),
          user2: connect(),
        })
        .then((conn) => {
          return Promise.props({
            user1: auth(conn.user1, user1),
            user2: auth(conn.user2, user2),
          })
        })
        .then((conn) => {
          connections = conn
        })
    })

    it('send 1 => 2', () => {
      return new Promise((resolve, reject) => {
        connections.user1.emit('message', {
          receiver: user2._id,
          content: 'user1'
        })
        connections.user2.on('message', (messages) => {
          assert(_.isArray(messages))
          assert(messages.length == 1)
          let message = messages[0]
          assert.equal(message.sender, user1._id)
          assert.equal(message.receiver, user2._id)
          assert.equal(message.content, 'user1')
          resolve()
        })
      })
    })

    it('send 2 => 1', () => {
      return new Promise((resolve, reject) => {
        connections.user2.emit('message', {
          receiver: user1._id,
          content: 'user2'
        })
        connections.user1.on('message', (messages) => {
          assert(_.isArray(messages))
          assert(messages.length == 1)
          let message = messages[0]
          assert.equal(message.sender, user2._id)
          assert.equal(message.receiver, user1._id)
          assert.equal(message.content, 'user2')
          resolve()
        })
      })
    })

  })

})