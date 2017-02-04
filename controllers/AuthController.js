var passport = require('passport');

module.exports = {

  // hasJwt: function (req, res, next) {

  //   var extractJwt = app.services.jwt.extractJwt;

  //   extractJwt(req, res)
  //     .then(function (user) {
  //       req.user = user;
  //       next();
  //     })
  //     .catch(function (err) {
  //       log.verbose('AuthController.hasJwt ::', err.message);
  //       res.unauthorized(err.message);
  //     });

  // },

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
        // switch(err.name) {
        //   case 'MongoError':
        //     if (err.code == 11000) {
        //       log.verbose('AuthController.register :: duplicate key');
        //       return res.badRequest({ message: err.errmsg });
        //     }
        //   case 'ValidationError':
        //     log.verbose('AuthController.register :: validation error');
        //     return res.badRequest({ message: err.errors });
        // }
        // next(err);
        log.verbose('AuthController.register ::', err.message);
        res.badRequest(err.message);
      });
  },

  /**
   * 登陆
   */
  login: function (req, res, next) {
    passport.authenticate('local', function(err, user) {
      // 使用本地验证策略对登录进行验证
      if (err) return res.badRequest(err.message);
      if (!user) return res.badRequest('No Such User');

      var accessToken = app.services.jwt.createAccessToken(user);
      var refreshToken = app.services.jwt.createRefreshToken(user);

      // 将 token 作为 cookie 返回
      // res.cookie('jwt', token);
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
    var jwt = app.services.jwt,
        refreshToken = req.body.refreshToken;

    if (!refreshToken)
      return res.badRequest('No Refresh Token');

    jwt.refreshToken(refreshToken)
      .then(function (tokens) {
        res.ok(tokens);
      })
      .catch(function (err) {
        log.verbose('AuthController.refresh ::', err.message);
        res.badRequest(err.message);
      });
  },

};