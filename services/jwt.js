var jwt = require('jsonwebtoken'),
    passport = require('passport'),
    jwtConfig = app.get('passport').jwt;

var jwtService = module.exports = {

  extractJwt: function extractJwt (req, res) {
    return new Promise(function (resolve, reject) {
      passport.authenticate('jwt', function (err, user, info) {
        if (err || !user)
          return reject(err || info);
        resolve(user);
      })(req, res);
    });
  },

  createAccessToken: function(user) {
    return jwt.sign(
      {
        user: user._id,
        type: 'access',
      },
      jwtConfig.secret,
      {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.accessTokenExpires,
        // issuer: jwtConfig.issuer,
        // audience: jwtConfig.audience
      }
    );
  },

  createRefreshToken: function(user) {
    return jwt.sign(
      {
        user: user,
        type: 'refresh',
      },
      jwtConfig.secret,
      {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.refreshTokenExpires,
        // issuer: jwtConfig.issuer,
        // audience: jwtConfig.audience
      }
    );
  },

  refreshToken: function(token) {
    return new Promise(function (resolve, reject) {
      jwt.verify(token, jwtConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != 'refresh') return reject(Error('Not Refresh Token'));
        var returnToken = {
          accessToken: jwtService.createAccessToken(decoded.user),
          refreshToken: jwtService.createRefreshToken(decoded.user),
        };
        resolve(returnToken);
      });
    });
  },

};