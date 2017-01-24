process.chdir(__dirname);

var express = require('express');
var path = require('path');
var http = require('http');

var _ = require('lodash');
var Promise = require('bluebird');
var includeAll = require('include-all');
var mongoose = require('mongoose');

// var index = require('./routes/index');
// var users = require('./routes/users');

var app = express();

app.set('path', __dirname);

var loadConfigs = function () {
  return new Promise(function (resolve, reject) {
    includeAll.aggregate({
      dirname: path.join(app.get('path'), 'configs'),
      filter: /(.+)\.js$/,
    }, function (err, modules) {
      if (err) return reject(err);
      for (var moduleName in modules) {
        app.set(moduleName, modules[moduleName]);
      }
      resolve(modules);
    });
  });
};

var loadControllers = function () {
  var controllers = includeAll({
    dirname: path.join(app.get('path'), 'controllers'),
    filter: /(.+)\.js$/,
  });
  app.set('controllers', controllers);
  return Promise.resolve(controllers);
};

var loadModels = function () {
  var models = includeAll({
    dirname: path.join(app.get('path'), 'models'),
    filter: /(.+)\.js$/,
  });
  app.models = models;
  return Promise.resolve(models);
};

var loadMiddlewares = function () {
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

var loadGlobals = function () {
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

var loadComponents = function () {
  var components = {
    logger: (function () {
      var logger = require('captains-log')(app.get('logger'));
      app.log = logger;
      return Promise.resolve(logger);
    })(),
  };
  return Promise.props(components);
};

// load all configs
loadConfigs()
  .then(loadComponents)
  .then(loadGlobals)
  .then(loadModels)
  .then(loadControllers)
  .then(loadMiddlewares)
  .then(function () {

    var mongoose = require('mongoose'),
        mongoConfig = app.get('connection');
    // use bluebird as mongoose promise
    mongoose.Promise = Promise;
    // connect to mongo database
    mongoose.connect('mongodb://' + mongoConfig.host
                            + ':' + mongoConfig.port
                            + '/' + mongoConfig.database);

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    var port = app.get('port') || 3000;

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
      var port = parseInt(val, 10);

      if (isNaN(port)) {
        // named pipe
        return val;
      }

      if (port >= 0) {
        // port number
        return port;
      }

      return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
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
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      app.log.info('Listening on ' + bind);
    }

  });
