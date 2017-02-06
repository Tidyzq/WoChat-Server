var assert = require('assert'),
    _ = require('lodash');

describe('UserController', function () {
  var username = 'testusercontroller',
      password = '123456',
      id,
      accessToken, refreshToken,
      wrongAccessToken = '1.2.3';

  var register = function () {
    return agent.post('/api/auth/register')
      .send({
        username: username,
        nickname: username,
        password: password
      })
      .expect(200)
      .expect(function (res) {
        assert.equal(res.body.username, username);
        assert.ifError(res.body.password);
      });
  };

  var login = function () {
    return agent.post('/api/auth/login')
      .send({
        username: username,
        password: password
      })
      .expect(200)
      .then(function (res) {
        assert(res.body.user);
        assert(res.body.user._id);
        assert(res.body.accessToken);
        assert(res.body.refreshToken);
        id = res.body.user._id;
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  };

  before(register);

  beforeEach(login);

  describe('findUser', function () {
    it('should able to get user info', function () {
      return agent.get('/api/users/' + id)
        .set('Authorization', 'JWT ' + accessToken)
        .expect(200)
        .expect(function (res) {
          assert.equal(res.body._id, id);
          assert.equal(res.body.username, username);
          assert.ifError(res.body.password);
          assert.ifError(res.body.contacts);
          assert.ifError(res.body.chat_groups);
        });
    });
    it('should not able to get user info without token', function () {
      return agent.get('/api/users/' + id)
        .expect(401);
    });
    it('should able to get user contacts and chat groups', function () {
      return agent.get('/api/users/' + id + '?contacts=1&chat_groups=1')
        .set('Authorization', 'JWT ' + accessToken)
        .expect(200)
        .expect(function (res) {
          assert.equal(res.body._id, id);
          assert.equal(res.body.username, username);
          assert.ifError(res.body.password);
          assert(res.body.contacts);
          assert(res.body.chat_groups);
        });
    });
  });

  describe('update', function () {
    it('should able to update', function () {
      return agent.put('/api/users/' + id)
        .set('Authorization', 'JWT ' + accessToken)
        .send({
          gender: 1
        })
        .expect(200)
        .expect(function (res) {
          assert.equal(res.body._id, id);
          assert.equal(res.body.username, username);
          assert.equal(res.body.gender, 1);
          assert.ifError(res.body.password);
        });
    });
    it('should able to change password', function () {
      this.timeout(5000);
      var newPassword = '654321';
      return agent.put('/api/users/' + id)
        .set('Authorization', 'JWT ' + accessToken)
        .send({
          password: newPassword
        })
        .expect(200)
        .then(function (res) {
          assert.equal(res.body._id, id);
          assert.equal(res.body.username, username);
          assert.ifError(res.body.password);
          password = newPassword;
        })
        .delay(1000)
        .then(login);
    });
    it('should not able to change without token', function () {
      return agent.put('/api/users/' + id)
        .send({
          gender: 0
        })
        .expect(401);
    });

  });

  describe('uploadAvatar', function () {
    it('should able to upload avatar', function () {
      return agent.post('/api/users/' + id + '/avatar')
        .set('Authorization', 'JWT ' + accessToken)
        .attach('avatar', 'tests/test.png')
        .expect(200)
        .expect(function (res) {
          assert(res.body.avatar);
        });
    });

    it('should not able to upload avatar without token', function () {
      return agent.post('/api/users/' + id + '/avatar')
        .attach('avatar', 'tests/test.png')
        .expect(401);
    });
  });

  describe('contacts', function () {
    var contact = {
      username: 'testcontactuser',
      nickname: 'testcontactuser',
      password: '123456',
    };
    before(function () {
      return agent.post('/api/auth/register')
        .send(contact)
        .expect(200)
        .then(function (res) {
          contact = _.extend(contact, res.body);
          return agent.post('/api/users/' + id + '/contacts')
            .set('Authorization', 'JWT ' + accessToken)
            .send({
              contact: contact._id
            })
            .expect(201);
        });
    });
    after(function () {
      return agent.delete('/api/users/' + id + '/contacts/' + contact._id)
        .set('Authorization', 'JWT ' + accessToken)
        .expect(200);
    });
    describe('getContacts', function () {
      it('should able to get contacts', function () {
        return agent.get('/api/users/' + id + '/contacts')
          .set('Authorization', 'JWT ' + accessToken)
          .expect(200)
          .expect(function (res) {
            assert(_.isArray(res.body));
            assert.equal(res.body.length, 1);
            var ct = res.body[0];
            assert.equal(ct.contact, contact._id);
          });
      });
      it('should able to get contacts with populate', function () {
        return agent.get('/api/users/' + id + '/contacts?populate=1')
          .set('Authorization', 'JWT ' + accessToken)
          .expect(200)
          .expect(function (res) {
            assert(_.isArray(res.body));
            assert.equal(res.body.length, 1);
            var ct = res.body[0].contact;
            assert(_.isMatch(contact, ct));
          });
      });
      it('shoubld not able to get contacts without token', function () {
        return agent.get('/api/users/' + id + '/contacts')
          .expect(401);
      });
    });
    describe('getContact', function () {
      it('should able to get contact', function () {
        return agent.get('/api/users/' + id + '/contacts/' + contact._id)
          .set('Authorization', 'JWT ' + accessToken)
          .expect(200)
          .expect(function (res) {
            assert.equal(res.body.contact, contact._id);
          });
      });
      it('should able to get contact with populate', function () {
        return agent.get('/api/users/' + id + '/contacts/' + contact._id + '?populate=1')
          .set('Authorization', 'JWT ' + accessToken)
          .expect(200)
          .expect(function (res) {
            assert(_.isMatch(contact, res.body.contact));
          });
      });
      it('should not able to get contact without token', function () {
        return agent.get('/api/users/' + id + '/contacts/' + contact._id)
          .expect(401);
      });
    });
  });



});