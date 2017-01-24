var App = require('../app/index'),
    supertest = require('supertest');

var testConfig = {
  environment: 'test',
  logger: {
    level: 'error'
  },
  connection: {
    mock: true,
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
