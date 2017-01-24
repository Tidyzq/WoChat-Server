module.exports = function (data) {

  data = data || '404 (Not Found)';

  log.verbose('res.notFound() :: Sending 404 (Not Found) response');

  this.status(404).json(data);
};