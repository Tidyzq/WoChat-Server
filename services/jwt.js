var jwt = require('jsonwebtoken'),
    passport = require('passport'),
    jwtConfig = app.get('passport').jwt;

module.exports = {

  extractJwt: function extractJwt (req, res) {
    return new Promise(function (resolve, reject) {
      passport.authenticate('jwt', function (err, user, info) {
        if (err || !user)
          return reject(err || info);
        resolve(user);
      })(req, res);
    });
  },

  createToken: function(id) {
    return jwt.sign(
      {
        user: id
      },
      jwtConfig.secret,
      {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.expiresIn,
        // issuer: jwtConfig.issuer,
        // audience: jwtConfig.audience
      }
    )
  },

};