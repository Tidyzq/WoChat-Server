module.exports = function(req, res, next) {
  log.verbose('404 middleware ::', req.originalUrl, 'not matching any route');
  res.notFound();
};