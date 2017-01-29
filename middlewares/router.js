var express = require('express');

var _config = app.get('routes'),
    controllers = app.get('controllers'),
    Router = express.Router;

var buildRouter = function (prefix, path, config) {
  var router = Router({mergeParams: true});

  for (var key in config) {
    var val = config[key];

    if (_.isString(val)) {
      val = [val];
    }

    if (_.isArray(val)) {

      var method = key;

      app.log.silly('Router Middleware :: Bind', method, prefix + path);

      var handlers = _.map(val, function (handlerPath) {
        var handler = _.get(controllers, handlerPath);
        if (!handler) log.error('Router Middleware ::', handlerPath, 'not found');
        return handler;
      });

      handlers = _.filter(handlers, _.isFunction);

      router[method].apply(router, _.concat(path, handlers));

    } else if (_.isObject(val)) {

      var subRouter = buildRouter(prefix + path, key, val);

      router.use(path, subRouter);

    }
  }

  return router;
};

module.exports = buildRouter('', '', _config);