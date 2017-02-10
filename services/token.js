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
    var _config = tokenConfig.types.access;
    return jwt.sign(
      {
        user: user._id,
        type: _config.typename,
      },
      tokenConfig.secret,
      {
        algorithm: tokenConfig.algorithm,
        expiresIn: _config.expires,
        // issuer: tokenConfig.issuer,
        // audience: tokenConfig.audience
      }
    );
  },

  /**
   * 验证 access token
   */
  verifyAccessToken: function (token) {
    var _config = tokenConfig.types.access;
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != _config.typename) return reject(Error('Not Access Token'));
        resolve(decoded);
      });
    });
  },

  /**
   * 产生 refresh token
   */
  createRefreshToken: function (user) {
    var _config = tokenConfig.types.refresh;
    return jwt.sign(
      {
        user: user,
        type: _config.typename,
      },
      tokenConfig.secret,
      {
        algorithm: tokenConfig.algorithm,
        expiresIn: _config.expires,
        // issuer: tokenConfig.issuer,
        // audience: tokenConfig.audience
      }
    );
  },

  /**
   * 验证 refresh token
   */
  verifyRefreshToken: function (token) {
    var _config = tokenConfig.types.refresh;
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != _config.typename) return reject(Error('Not Refresh Token'));
        resolve(decoded);
      });
    });
  },

  /**
   * 创建 invitation token
   */
  createInvitationToken: function (sender, receiver, message) {
    var _config = tokenConfig.types.invitation;
    return jwt.sign(
      {
        sender: sender,
        receiver: receiver,
        message: message,
        type: _config.typename,
      },
      tokenConfig.secret,
      {
        algorithm: tokenConfig.algorithm,
        expiresIn: _config.expires,
        // issuer: tokenConfig.issuer,
        // audience: tokenConfig.audience
      }
    );
  },

  /**
   * 验证 invitation token
   */
  verifyInvitationToken: function (token) {
    var _config = tokenConfig.types.invitation;
    return new Promise(function (resolve, reject) {
      jwt.verify(token, tokenConfig.secret, function (err, decoded) {
        if (err) return reject(err);
        if (decoded.type != _config.typename) return reject(Error('Not Invitation Token'));
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