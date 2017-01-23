process.chdir(__dirname);

var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var _ = require('lodash');
var Promise = require('bluebird');
var includeAll = require('include-all');

var debug = require('debug')('wochat-server-new:server');

// var index = require('./routes/index');
// var users = require('./routes/users');

var app = global.app = express();
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

// load all configs
loadConfigs()
  .then(loadControllers)
  // load middlewares
  .then(function () {
    var _config = app.get('middleware');
    return Promise.each(_config.order, function (moduleName) {
      // TODO: use better logger
      console.log('Loading middleware:', moduleName);
      app.use(_config[moduleName]);
    });
  })
  // load routers
  .then(function () {

    var _config = app.get('routes'),
        controllers = app.get('controllers'),
        policies = app.get('policies');

    for (var routePath in _config) {

      if (!_.isObject(_config[routePath]))
        _config[routePath] = { get: _config[routePath] };
      for (var method in _config[routePath]) {
        var handlers = _config[routePath][method];

        if (!_.isArray(handlers))
          handlers = [handlers];

        console.log('Bind', method, routePath, handlers);

        handlers = _.map(handlers, function (handlerPath) {
          return _.get(controllers, handlerPath);
        });

        app[method].apply(app, _.concat(routePath, handlers));
      }
    }
  })
  .then(function () {
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  })
  .then(function () {
    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

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
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
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
      debug('Listening on ' + bind);
    }

  });
