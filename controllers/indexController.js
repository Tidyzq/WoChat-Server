module.exports = {
  index: function (req, res, next) {
    res.serverError('test serverError');
    // res.render('index', { title: 'Express' });
  },

  test: function (req, res, next) {
    console.log('test');
    next();
  },
}

