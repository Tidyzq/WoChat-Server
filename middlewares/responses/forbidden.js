module.exports = function (data) {

  data = data || '403 (Forbidden)';

  log.verbose('res.forbidden() :: Sending 403 (Forbidden) response');

  this.status(403).json(data);
};