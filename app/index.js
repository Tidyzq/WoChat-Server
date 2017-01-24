var express = require('express');
var path = require('path');
var http = require('http');

var _ = require('lodash');
var Promise = require('bluebird');
var includeAll = require('include-all');
var mongoose = require('mongoose');

var App = (function(){
  var prototype = App.prototype, constructor = App;
  function App() {

    this.app = express();

  };

  prototype.loadConfigs = function (overrideConfig) {
    var app = this.app;
    app.set('path', process.cwd());
    return new Promise(function (resolve, reject) {
      includeAll.aggregate({
        dirname: path.join(app.get('path'), 'configs'),
        filter: /(.+)\.js$/,
      }, function (err, modules) {
        if (err) return reject(err);
        modules = _.merge(modules, overrideConfig);
        for (var moduleName in modules) {
          app.set(moduleName, modules[moduleName]);
        }
        resolve(modules);
      });
    });
  };

  prototype.loadControllers = function () {
    var app = this.app;
    var controllers = includeAll({
      dirname: path.join(app.get('path'), 'controllers'),
      filter: /(.+)\.js$/,
    });
    app.set('controllers', controllers);
    return Promise.resolve(controllers);
  };

  prototype.loadModels = function () {
    var app = this.app;
    var models = includeAll({
      dirname: path.join(app.get('path'), 'models'),
      filter: /(.+)\.js$/,
    });
    app.models = models;
    return Promise.resolve(models);
  };

  prototype.loadMiddlewares = function () {
    var app = this.app;
    var middlewares = includeAll({
      dirname: path.join(app.get('path'), 'middlewares'),
      filter: /(.+)\.js$/,
    });
    var middlewareConfig = app.get('middleware');
    return Promise.each(middlewareConfig.order, function (moduleName) {
      app.log.silly('Loading middleware:', moduleName);
      app.use(middlewareConfig[moduleName] || middlewares[moduleName]);
    });
  };

  prototype.loadGlobals = function () {
    var app = this.app;
    var globalConfig = app.get('globals');
    if (!_.isObject(globalConfig) || _.isEmpty(globalConfig)) return;
    if (globalConfig.app)
      global.app = app;
    if (globalConfig.promise)
      global.Promise = Promise;
    if (globalConfig.log)
      global.log = app.log;
    if (globalConfig.lodash)
      global._ = _;
  };

  prototype.loadComponents = function () {
    var app = this.app;
    var components = {
      logger: (function () {
        var logger = require('captains-log')(app.get('logger'));
        app.log = logger;
        return Promise.resolve(logger);
      })(),
    };
    return Promise.props(components);
  };

  prototype.connectDatabase = function () {
    var app = this.app;
    var mongoose = require('mongoose'),
        mongoConfig = app.get('connection');

    var mongoPath = 'mongodb://' + mongoConfig.host +
        ':' + mongoConfig.port +
        '/' + mongoConfig.database;

    // use bluebird as mongoose promise
    mongoose.Promise = Promise;
    // connect to mongo database
    var tryMock = function () {
      if (mongoConfig.mock) {
        try {
          var mockgoose = require('mockgoose');
          return mockgoose(mongoose)
            .then(function () {
              app.log.verbose('Mock enabled, use memory as database.');
            });
        } catch (err) {
          app.log.warn('Set "mock: true" in configs/connection.js but "mockgoose" is not installed.');
        }
      }
      return Promise.resolve();
    };

    var connect = function () {
      return mongoose.connect(mongoPath);
    };

    return tryMock()
      .then(connect)
      .then(function () {
        app.log.info('Mongoose connected to', mongoPath);
      });
  };

  prototype.startHttp = function () {

    var app = this.app;

    var server = http.createServer(app);

    var port = app.get('port') || 3000;

    var onError = function (error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          app.log.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          app.log.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    };

    var onListening = function () {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      app.log.info('Listening on ' + bind);
    };

    server.listen(port);

    server.on('error', onError);
    server.on('listening', onListening);
  };

  prototype.start = function (overrideConfig) {
    var app = this;
    return app.loadConfigs(overrideConfig)
      .then(function () { return app.loadComponents(); })
      .then(function () { return app.loadGlobals(); })
      .then(function () { return app.loadModels(); })
      .then(function () { return app.loadControllers(); })
      .then(function () { return app.loadMiddlewares(); })
      .then(function () { return app.connectDatabase(); })
      .then(function () { return app.startHttp(); });
  };

  return App;

})();

module.exports = App;