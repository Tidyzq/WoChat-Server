module.exports = {

  hasJwt: function (req, res, next) {

    var extractJwt = app.services.jwt.extractJwt;

    extractJwt(req, res)
      .then(function (user) {
        req.user = user;
        next();
      })
      .catch(function (err) {
        log.verbose('AuthController.hasJwt ::', err.message);
        res.unauthorized(err.message);
      });

  },

};