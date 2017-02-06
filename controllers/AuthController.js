var passport = require('passport');

module.exports = {

  /**
   * 检查请求是否附带了合法的 access token
   */
  hasAccessToken: function (req, res, next) {
    var tokenService = app.services.token;

    tokenService.extractTokenFromHeader(req)
      .then(tokenService.verifyAccessToken)
      .then(function (decoded) {
        req.user = decoded.user;
        next();
      })
      .catch(function (err) {
        log.verbose('AuthController::hasAccessToken', err.message);
        res.unauthorized(err.message);
      });
  },

  /**
   * 注册
   */
  register: function (req, res, next) {
    // 由请求参数构造待创建User对象
    var User = app.models.User,
        value = req.body;
    User.create(value)
      // 创建成功，返回创建用户
      .then(function (created) {
        return User.findOne({ _id: created._id })
          .lean()
          .then(function (user) {
            res.ok(user);
          });
      })
      // 如果有误，返回错误
      .catch(function (err) {
        log.verbose('AuthController.register ::', err.message);
        res.badRequest(err.message);
      });
  },

  /**
   * 登陆
   */
  login: function (req, res, next) {
    var tokenService = app.services.token;

    passport.authenticate('local', function(err, user) {
      // 使用本地验证策略对登录进行验证
      if (!err && !user) err = Error('No Such User');

      if (err) {
        log.verbose('AuthController::login', err.message);
        return res.badRequest(err.message);
      }

      var accessToken = tokenService.createAccessToken(user);
      var refreshToken = tokenService.createRefreshToken(user);

      // 将 token 作为 http body 返回
      return res.ok({
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

    })(req, res);
  },

  /**
   * 刷新 token
   */
  refresh: function (req, res, next) {
    var tokenService = app.services.token,
        refreshToken = req.body.refreshToken;

    if (!refreshToken)
      return res.badRequest('No Refresh Token');

    tokenService.refreshToken(refreshToken)
      .then(function (tokens) {
        res.ok(tokens);
      })
      .catch(function (err) {
        log.verbose('AuthController.refresh ::', err.message);
        res.badRequest(err.message);
      });
  },

};