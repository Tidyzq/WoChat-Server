module.exports = function(req, res, next) {
  log.verbose(req.originalUrl, 'not matching any route');
  res.notFound();
};