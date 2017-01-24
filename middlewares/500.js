module.exports = function(err, req, res, next) {
  log.error('Got Server Error:', err);
  var data = (req.app.get('env') === 'production' ? {} : err);
  res.serverError(data);
};