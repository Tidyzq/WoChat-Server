var jwt = require('jsonwebtoken'),
    tokenConfig = app.get('token');

var tokenService = module.exports = {

  createAccessToken: function (user) {
    return jwt.sign(
      {
        user: user._id,
        type: 'access',
      },
      tokenConfig.secret,
      {
        algorithm: tokenConfig.algorithm,
        expiresIn: tokenConfig.accessTokenExpires,
        // issuer: tokenConfig.issuer,
        // audience: tokenConfig.audience
      }
    );
  },

  verifyAccessToken: function (token) {
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != 'access') return reject(Error('Not Access Token'));
        resolve(decoded);
      });
    });
  },

  createRefreshToken: function (user) {
    return jwt.sign(
      {
        user: user,
        type: 'refresh',
      },
      tokenConfig.secret,
      {
        algorithm: tokenConfig.algorithm,
        expiresIn: tokenConfig.refreshTokenExpires,
        // issuer: tokenConfig.issuer,
        // audience: tokenConfig.audience
      }
    );
  },

  verifyRefreshToken: function (token) {
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != 'refresh') return reject(Error('Not Refresh Token'));
        resolve(decoded);
      });
    });
  },

  refreshToken: function (token) {
    return tokenService.verifyRefreshToken(token)
      .then(function (decoded) {
        return {
          accessToken: tokenService.createAccessToken(decoded.user),
          refreshToken: tokenService.createRefreshToken(decoded.user),
        };
      });
  },

};