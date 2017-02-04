module.exports = function (data) {

  data = data || '500 (Server Error)';

  log.verbose('res.serverError() :: Sending', data, 'response');

  this.status(500).json(data);
};