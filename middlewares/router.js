var express = require('express');

var _config = app.get('routes'),
    controllers = app.get('controllers'),
    router = express.Router();

for (var routePath in _config) {

  if (!_.isObject(_config[routePath]))
    _config[routePath] = { get: _config[routePath] };

  for (var method in _config[routePath]) {
    var handlers = _config[routePath][method];

    if (!_.isArray(handlers))
      handlers = [handlers];

    app.log.silly('Bind', method, routePath, handlers);

    handlers = _.map(handlers, function (handlerPath) {
      return _.get(controllers, handlerPath);
    });

    router[method].apply(router, _.concat(routePath, handlers));
  }

}

module.exports = router;