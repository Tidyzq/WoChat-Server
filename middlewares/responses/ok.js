module.exports = function (data) {

  data = data || '200 (Ok)';

  log.verbose('res.ok() :: Sending 200 (Ok) response');

  this.status(200).json(data);
};