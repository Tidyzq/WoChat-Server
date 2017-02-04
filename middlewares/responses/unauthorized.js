module.exports = function (data) {

  data = data || '401 (Unauthorized)';

  log.verbose('res.Unauthorized() :: Sending', data, 'response');

  this.status(401).json(data);
};