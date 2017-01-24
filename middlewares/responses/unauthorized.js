module.exports = function (data) {

  data = data || '401 (Unauthorized)';

  log.verbose('res.Unauthorized() :: Sending 401 (Unauthorized) response');

  this.status(401).json(data);
};