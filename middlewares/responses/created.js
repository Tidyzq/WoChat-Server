module.exports = function (data) {

  data = data || '201 (Created)';

  log.verbose('res.created() :: Sending', data, 'response');

  this.status(201).json(data);
};