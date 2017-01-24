module.exports = function (req, res, next) {
  res.set('X-Powresered-By', 'Tidyzq');
  next();
};