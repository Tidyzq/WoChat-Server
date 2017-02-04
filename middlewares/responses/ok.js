module.exports = function (data) {

  data = data || '200 (Ok)';

  log.verbose('res.ok() :: Sending', data, 'response');

  this.status(200).json(data);
};