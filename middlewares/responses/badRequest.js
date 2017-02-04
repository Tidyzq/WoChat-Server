module.exports = function (data) {

  data = data || '400 (Bad Request)';

  log.verbose('res.badRequest() :: Sending', data, 'response');

  this.status(400).json(data);
};