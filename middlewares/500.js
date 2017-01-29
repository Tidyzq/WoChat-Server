module.exports = function(err, req, res, next) {
  log.error('500 middleware ::', err);
  if (err instanceof Error) err = err.message;
  var data = (req.app.get('env') === 'production' ? {} : err);
  res.serverError(data);
};