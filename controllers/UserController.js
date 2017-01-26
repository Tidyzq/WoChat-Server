var passport = require('passport');

module.exports = {

  /**
   * 检查是否是用户自身
   */
  isSelf: function (req, res, next) {
    if (req.user && req.params.id && req.user._id == req.params.id) {
      return next();
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
              log.verbose('UserController.register :: duplicate key');
              return res.badRequest({ message: err.errmsg });
            }
          case 'ValidationError':
            log.verbose('UserController.register :: validation error');
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
      res.cookie('jwt', token);
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
        select = '';

    if (req.query.contacts)
      select += ' +contacts';
    if (req.query['chat_groups'])
      select += ' +chat_groups';

    // 如果设置了 contacts 或 chat_groups 则需要为用户本人
    if (!_.isEmpty(select) && (!req.user || req.user._id != req.params.id)) {
      return res.unauthorized();
    }

    User.findOne({ _id: id })
      .lean()
      .select(select)
      .then(function (user) {
        if (user) return user;
        throw new Error('User Not Found');
      })
      .then(function (user) {
        res.ok(user);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            if (err.message == 'User Not Found')
              return res.notFound();
            break;
          case 'CastError':
            return res.notFound();
        }
        next(err);
      });
  },

  /**
   * 更改用户信息
   */
  update: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id,
        value = req.body;

    value.id = id;

    User.findOne({ _id: id })
      .then(function (user) {
        if (user) return user;
        throw new Error('User Not Found');
      })
      .then(function (user) {
        user = _.merge(user, value);
        user.save();
        return user.toObject();
      })
      .then(function (user) {
        delete user.password;
        res.ok(user);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            if (err.message == 'User Not Found')
              log.verbose('UserController.update :: user not found');
              return res.notFound();
            break;
          case 'CastError':
            log.verbose('UserController.update :: cast error');
            return res.badRequest();
          case 'MongoError':
            if (err.code == 11000) {
              log.verbose('UserController.update :: duplicate key');
              return res.badRequest({ message: err.errmsg });
            }
            break;
        }
        next(err);
      })
  },

  /**
   * 获取用户联系人
   */
  getContacts: function (req, res, next) {
    var User = app.models.User,
        utils = app.services.utils,
        id = req.params.id,
        populate = req.query.populate,
        sort = req.query.sort ? _.split(req.query.sort, ',') : [],
        skip = req.query.skip ? _.toInteger(req.query.skip) : 0,
        limit = req.query.limit ? _.toInteger(req.query.limit) : 30;

    var query = User.findOne({ _id: id })
      .select('+contacts');

    if (populate) {
      query = query.populate('contacts.contact');
    }

    query.lean()
      .then(function (user) {
        if (user) return user.contacts;
        throw new Error('User Not Found');
      })
      .then(utils.sort(sort))
      .then(utils.slice(skip, limit))
      .then(function (contacts) {
        res.ok(contacts);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            if (err.message == 'User Not Found')
              return res.notFound();
            break;
          case 'CastError':
            return res.notFound();
        }
        next(err);
      });
  },



};
