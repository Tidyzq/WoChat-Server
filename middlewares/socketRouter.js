var _config = app.get('socket').routes,
    controllers = app.controllers,
    Router = require('socket.io-events');

var buildRouter = function (prefix, config) {
  var router = Router();

  for (var key in config) {
    var val = config[key];

    if (_.isString(val)) {
      val = [val];
    }

    if (_.isArray(val)) {

      var event = key;

      log.silly('Socket Router Middleware :: Bind', prefix + event);

      var handlers = _.map(val, function (handlerPath) {
        var handler = _.get(controllers, handlerPath);
        if (!handler) log.error('Socket Router Middleware ::', handlerPath, 'not found');
        return handler;
      });

      handlers = _.filter(handlers, _.isFunction);

      router.use.apply(router, _.concat(event, handlers));

    } else if (_.isObject(val)) {

      var subRouter = buildRouter(prefix + key, val);

      router.use(key, subRouter);

    }
  }

  return router;
};

module.exports = buildRouter('', _config);