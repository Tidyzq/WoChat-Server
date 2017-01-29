module.exports = function (req, res, next) {
  res.set('X-Powered-By', 'Tidyzq');
  next();
};