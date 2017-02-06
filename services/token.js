var jwt = require('jsonwebtoken'),
    tokenConfig = app.get('token');

var extractRegex = /(\S+)\s+(\S+)/;

var tokenService = module.exports = {

  /**
   * 从 auth 头部提取 token
   */
  extractTokenFromHeader: function (req) {

    return Promise.resolve()
      .then(function () {
        var authorization = req.get(tokenConfig.headerField);
        if (!authorization) throw Error('No Authorization Header');
        return authorization;
      })
      .then(function (headerValue) {
        var matches = headerValue.match(extractRegex);
        if (!matches) throw Error('Invalid Authorization Header');
        return {
          scheme: matches[1],
          value: matches[2]
        };
      })
      .then(function (headerParams) {
        if (headerParams.scheme == tokenConfig.headerScheme)
          return headerParams.value;
        throw Error('Invalid Authorization Scheme');
      });
  },

  /**
   * 产生 access token
   */
  createAccessToken: function (user) {
    return jwt.sign(
      {
        user: user._id,
        type: tokenConfig.accessTokenType,
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

  /**
   * 验证 access token
   */
  verifyAccessToken: function (token) {
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != tokenConfig.accessTokenType) return reject(Error('Not Access Token'));
        resolve(decoded);
      });
    });
  },

  /**
   * 产生 refresh token
   */
  createRefreshToken: function (user) {
    return jwt.sign(
      {
        user: user,
        type: tokenConfig.refreshTokenType,
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

  /**
   * 验证 refresh token
   */
  verifyRefreshToken: function (token) {
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != tokenConfig.refreshTokenType) return reject(Error('Not Refresh Token'));
        resolve(decoded);
      });
    });
  },

  /**
   * 使用 refresh token 获取更新的 accessToken 和 refreshToken
   */
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