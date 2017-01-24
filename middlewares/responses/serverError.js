module.exports = function (data) {

  data = data || '500 (Server Error)';

  log.verbose('res.serverError() :: Sending 500 (Server Error) response');

  this.status(500).json(data);
};