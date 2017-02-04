module.exports = function (data) {

  data = data || '404 (Not Found)';

  log.verbose('res.notFound() :: Sending', data, 'response');

  this.status(404).json(data);
};