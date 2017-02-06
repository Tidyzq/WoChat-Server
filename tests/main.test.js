var App = require('../app/index'),
    supertest = require('supertest');

var testConfig = {
  env: 'test',
  logger: {
    level: 'verbose',
  },
  static: '.tmp',
  image: {
    path: '.tmp/images',
  },
};

before(function () {
  this.timeout(5000);
  // start app for tests
  var server = new App();
  return server.start(testConfig)
    .then(function () {
      var app = server.app;
      global.agent = supertest(app);
    });
});

// after(function (done) {
//   app.lower(done);
// });
