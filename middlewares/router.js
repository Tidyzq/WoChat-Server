var express = require('express');

var _config = app.get('routes'),
    controllers = app.get('controllers'),
    Router = express.Router;

var buildRouter = function (prefix, path, config) {
  var router = Router();

  for (var key in config) {
    var val = config[key];

    if (_.isString(val)) {
      val = [val];
    }

    if (_.isArray(val)) {

      app.log.silly('Router Bind:', key, prefix + path, val);

      var handlers = _.map(val, function (handlerPath) {
        return _.get(controllers, handlerPath);
      });

      router[key].apply(router, _.concat(path, handlers));

    } else if (_.isObject(val)) {

      var subRouter = buildRouter(prefix + path, key, val);

      router.use(path, subRouter);

    }
  }

  return router;
};

module.exports = buildRouter('', '', _config);