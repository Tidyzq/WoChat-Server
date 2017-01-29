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

  prototype.loadConfigs = function (overrideConfigs) {
    var app = this.app;
    // set working path
    app.set('path', process.cwd());

    return Promise
      .props({

        customConfigs: new Promise(function (resolve, reject) {
          includeAll.aggregate({
            dirname: path.join(app.get('path'), 'configs'),
            excludeDirs: /^env$/,
            filter: /(.+)\.js$/,
          }, function (err, configs) {
            if (err) return reject(err);
            resolve(configs);
          });
        }),

        envConfigs: includeAll({
          dirname: path.join(app.get('path'), 'configs', 'env'),
          filter: /(.+)\.js$/,
        }),

        overrideConfigs: overrideConfigs || {},

      })
      .then(function (configs) {
        var env = configs.overrideConfigs.env || configs.customConfigs.env || app.get('env');
        configs.envConfigs = configs.envConfigs[env];

        configs = _.merge(configs.customConfigs, configs.envConfigs, configs.overrideConfigs);

        for (var moduleName in configs) {
          app.set(moduleName, configs[moduleName]);
        }
        return configs;
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

  prototype.loadServices = function () {
    var app = this.app;
    var services = includeAll({
      dirname: path.join(app.get('path'), 'services'),
      filter: /(.+)\.js$/,
    });
    app.services = services;
    return Promise.resolve(services);
  };

  prototype.loadMiddlewares = function () {
    var app = this.app;
    var middlewares = includeAll({
      dirname: path.join(app.get('path'), 'middlewares'),
      filter: /(.+)\.js$/,
    });
    app.middlewares = middlewares;
    return Promise.resolve(middlewares);
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

  prototype.loadHttp = function () {
    var app = this.app,
        middlewareOrder = app.get('http').middlewares || [],
        middlewares = app.middlewares || {},
        installed = [];

    middlewareOrder.forEach(function (middlewareName) {
      if (_.has(middlewares, middlewareName)) {
        app.log.silly('App.loadHttp :: middleware', middlewareName, 'installed');
        var middleware = middlewares[middlewareName];
        app.use(middleware);
        installed.push(middlewareName);
      } else {
        app.log.warn('App.loadHttp :: middleware', middlewareName, 'not found');
      }
    });
    return Promise.resolve(installed);
  };

  prototype.startServer = function () {
    var app = this.app;

    var server = http.createServer(app);

    app.socket.attach(server);

    var port = app.get('port') || 3000;
    var hostname = app.get('hostname') || '127.0.0.1';

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
        ? addr
        : addr.address + ':' + addr.port;
      app.log.info('Listening on ' + bind);
    };

    server.listen(port, hostname);

    server.on('error', onError);
    server.on('listening', onListening);
  };

  prototype.loadSocket = function () {
    var app = this.app,
        socketConfig = app.get('socket');

    var socket = require('socket.io')({ path: socketConfig.path });

    app.socket = socket;

    var numUsers = 0;

    socket.on('connection', function (client) {
      app.log.silly('socket connect');
      var addedUser = false;

      // when the client emits 'new message', this listens and executes
      client.on('new message', function (data) {
        // we tell the client to execute 'new message'
        client.broadcast.emit('new message', {
          username: client.username,
          message: data
        });
      });

      // when the client emits 'add user', this listens and executes
      client.on('add user', function (username) {
        app.log.silly('socket add user');
        if (addedUser) return;

        // we store the username in the client session for this client
        client.username = username;
        ++numUsers;
        addedUser = true;
        client.emit('login', {
          numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        client.broadcast.emit('user joined', {
          username: client.username,
          numUsers: numUsers
        });
      });

      // when the client emits 'typing', we broadcast it to others
      client.on('typing', function () {
        client.broadcast.emit('typing', {
          username: client.username
        });
      });

      // when the client emits 'stop typing', we broadcast it to others
      client.on('stop typing', function () {
        client.broadcast.emit('stop typing', {
          username: client.username
        });
      });

      // when the user disconnects.. perform this
      client.on('disconnect', function () {
        if (addedUser) {
          --numUsers;

          // echo globally that this client has left
          client.broadcast.emit('user left', {
            username: client.username,
            numUsers: numUsers
          });
        }
      });
    });

    return Promise.resolve(socket);

  };

  prototype.start = function (overrideConfig) {
    var app = this;
    return app.loadConfigs(overrideConfig)
      .then(function () { return app.loadComponents(); })
      .then(function () { return app.loadGlobals(); })
      .then(function () { return app.loadModels(); })
      .then(function () { return app.loadServices(); })
      .then(function () { return app.loadControllers(); })
      .then(function () { return app.loadMiddlewares(); })
      .then(function () { return app.connectDatabase(); })
      .then(function () { return app.loadHttp(); })
      .then(function () { return app.loadSocket(); })
      .then(function () { return app.startServer(); });
  };

  return App;

})();

module.exports = App;