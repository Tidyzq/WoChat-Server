var passport = require('passport'),
    ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

  /**
   * 检查是否是用户自身
   */
  isSelf: function (req, res, next) {
    if (req.user && req.params.id && req.user._id == req.params.id) {
      log.verbose(req.user._id, req.params.id);
      next();
    }
    res.unauthorized();
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
        switch(err.name) {
          case 'MongoError':
            if (err.code == 11000) {
              log.verbose('usersController.register :: duplicate key');
              return res.badRequest({ message: err.errmsg });
            }
          case 'ValidationError':
            log.verbose('usersController.register :: validation error');
            return res.badRequest({ message: err.errors });
        }
        next(err);
      });
  },

  /**
   * 登陆
   */
  login: function (req, res, next) {
    // 使用本地验证策略对登录进行验证
    passport.authenticate('local', function(err, user) {
      if (err || !user)
        return res.badRequest(err);

      delete user.password;
      var token = app.services.jwt.createToken(user);

      // 将 token 作为 cookie 返回
      // res.cookie('jwt', token);
      // 将 token 作为 http body 返回
      return res.ok({
        user: user,
        token: token
      });

    })(req, res);
  },

  /**
   * 获取用户信息
   */
  findOne: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id;
    User.findOne({ _id: id })
      .lean()
      .then(function (user) {
        res.ok(user);
      })
      .catch(function (err) {
        next(err);
      });
  },

};
