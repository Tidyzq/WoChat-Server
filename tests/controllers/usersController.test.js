var assert = require('assert');

describe('AuthController', function () {
  describe('/register', function () {
    it('should able to register', function () {
      return agent.post('/register')
        .send({
          username: 'testuser',
          nickname: 'testuser',
          password: '123456'
        })
        .expect(200)
        .then(function (res) {
          assert.equal(res.body.username, 'testuser');
        });
    });
    it('should not register again', function () {
      return agent.post('/register')
        .send({
          username: 'testuser',
          nickname: 'testuser',
          password: '123'
        })
        .expect(400);
    });
    it('must provide password', function () {
      return agent.post('/register')
        .send({
          username: 'agentanotheruser',
          nickname: 'testuser',
        })
        .expect(400);
    });
  });
  describe('/login', function () {
    it('should able to login', function () {
      return agent.post('/login')
        .send({
          username: 'testuser',
          password: '123456'
        })
        .expect(200)
        .expect(function (res) {
          assert(res.body.user);
          assert(res.body.token);
          assert.equal(res.body.user.username, 'testuser');
        });
    });
    it('should not able to login with wrong password', function () {
      return agent.post('/login')
        .send({
          username: 'testuser',
          password: '123'
        })
        .expect(400);
    });
  });
  // describe('/logout', function () {
  //   it('should able to logout if loged in', function () {
  //     return agent.get('/logout')
  //       .expect(200);
  //   });
  //   it('should not able to logout again', function () {
  //     return agent.get('/logout')
  //       .expect(403);
  //   });
  // });

});