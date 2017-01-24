module.exports = function(err, req, res, next) {
  log.error('500 middleware ::', err);
  var data = (req.app.get('env') === 'production' ? {} : err);
  res.serverError(data);
};