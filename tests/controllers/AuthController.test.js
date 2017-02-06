var assert = require('assert');

describe('AuthController', function () {
  describe('register', function () {
    it('should able to register', function () {
      return agent.post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'testuser',
          password: '123456'
        })
        .expect(200)
        .expect(function (res) {
          assert.equal(res.body.username, 'testuser');
          assert.equal(res.body.nickname, 'testuser');
          assert.ifError(res.body.password);
        });
    });
    it('should not register again', function () {
      return agent.post('/api/auth/register')
        .send({
          username: 'testuser',
          nickname: 'testuser',
          password: '123'
        })
        .expect(400);
    });
    it('must provide password', function () {
      return agent.post('/api/auth/register')
        .send({
          username: 'agentanotheruser',
          nickname: 'testuser',
        })
        .expect(400);
    });
  });
  describe('login', function () {
    it('should able to login', function () {
      return agent.post('/api/auth/login')
        .send({
          username: 'testuser',
          password: '123456'
        })
        .expect(200)
        .expect(function (res) {
          assert(res.body.user);
          assert.equal(res.body.user.username, 'testuser');
          assert(res.body.accessToken);
          assert(res.body.refreshToken);
        });
    });
    it('should not able to login with wrong password', function () {
      return agent.post('/api/auth/login')
        .send({
          username: 'testuser',
          password: '123'
        })
        .expect(400);
    });
    it('should not able to login without password', function () {
      return agent.post('/api/auth/login')
        .send({
          username: 'testuser',
        })
        .expect(400);
    });
  });
  describe('refresh', function () {
    var accessToken, refreshToken;
    before(function (done) {
      this.timeout(5000);
      agent.post('/api/auth/login')
        .send({
          username: 'testuser',
          password: '123456'
        })
        .expect(200)
        .expect(function (res) {
          assert(res.body.user);
          assert.equal(res.body.user.username, 'testuser');
          assert(res.body.accessToken);
          assert(res.body.refreshToken);
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        })
        .then(function () {
          setTimeout(done, 1000);
        });
    });
    it('should able to refresh', function () {
      return agent.post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect(function (res) {
          assert(res.body.accessToken);
          assert(res.body.refreshToken);
          assert.notEqual(res.body.accessToken, accessToken);
          assert.notEqual(res.body.refreshToken, refreshToken);
        });
    });
    it('should not able to refresh with wrong token', function () {
      return agent.post('/api/auth/refresh')
        .send({
          refreshToken: accessToken,
        })
        .expect(400);
    });
  });

});