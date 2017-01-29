var passport = require('passport'),
    path = require('path');

module.exports = {

  /**
   * 检查是否是用户自身
   */
  isSelf: function (req, res, next) {
    if (req.user && req.params.id && req.user._id == req.params.id) {
      return next();
    }
    log.verbose('UserController.isSelf :: unauthorized');
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
      var token = app.services.jwt.createToken(user._id);

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
   * 上传头像
   */
  uploadAvatar: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id,
        savePath = path.join(app.get('path'), 'public/images');

    var saveAvatar = function () {
      return new Promise(function (resolve, reject) {
      req.file('avatar')
        .upload(
          {
            dirname: savePath
          }
          , function (err, files) {
          if (err) return reject(err);
          if (files.length == 0) reject(new Error('No Avatar Provided'));
          resolve(files[0]);
        });
      });
    };

    saveAvatar()
      .then(function (file) {
        var url = 'http://' + app.get('hostname') + ':' + app.get('port') + '/images/'+
                  path.relative(savePath, file.fd);
        return url;
      })
      .then(function (url) {
        return User.findOne({ _id: id })
          .then(function (user) {
            if (!user) throw new Error('User Not Found');
            user.avatar = url;
            user.save();
            return user.toObject();
          });
      })
      .then(function (user) {
        res.ok(user);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            switch (err.message) {
              case 'User Not Found':
                return res.notFound();
              case 'No Avatar Provided':
                return res.badRequest();
            }
            break;
        }
        next(err);
      });
  },

  /**
   * 获取用户联系人列表
   */
  getContacts: function (req, res, next) {
    var User = app.models.User,
        utils = app.services.utils,
        id = req.params.id,
        populate = req.query.populate,
        sort = req.query.sort,
        skip = req.query.skip,
        limit = req.query.limit;

    var query = User.findOne({ _id: id })
      .select('contacts');

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

  /**
   * 添加联系人
   */
  addContact: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id,
        value = req.body;

    User.findOne({ _id: id })
      .select('contacts')
      .then(function (user) {
        if (user) return user;
        throw new Error('User Not Found');
      })
      .then(function (user) {
        var findRst = _.filter(user.contacts, function (doc) {
          return doc.contact.toString() == value.contact;
        });
        if (findRst.length) throw new Error('Contact Already Exists');
        return user;
      })
      .then(function (user) {
        user.contacts.push(value);
        return user.save()
          .then(function () {
            return value;
          });
      })
      .then(function (contact) {
        res.created(contact);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            switch (err.message) {
              case 'User Not Found':
                log.verbose('UserController.addContact :: user not found');
                return res.notFound(err.message);
              case 'Contact Already Exists':
                log.verbose('UserController.addContact :: contact already exists');
                return res.badRequest(err.message);
            }
            break;
          case 'CastError':
            return res.notFound(err.message);
        }
        next(err);
      });
  },

  /**
   * 获取联系人数量
   */
  countContacts: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id;

    User.findOne({ _id: id })
      .select('contacts')
      .lean()
      .then(function (user) {
        if (user) return user.contacts;
        throw new Error('User Not Found');
      })
      .then(function (contacts) {
        res.ok({
          count: contacts.length
        });
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            switch (err.message) {
              case 'User Not Found':
                log.verbose('UserController.addContact :: user not found');
                return res.notFound(err.message);
            }
            break;
          case 'CastError':
            return res.notFound(err.message);
        }
        next(err);
      });
  },

  /**
   * 更新联系人
   */
  updateContact: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id,
        cid = req.params.cid,
        value = req.body;

    value.contact = cid;

    User.findOne({ _id: id })
      .select('contacts')
      .then(function (user) {
        if (user) return user;
        throw new Error('User Not Found');
      })
      .then(function (user) {
        var findRst = _.filter(user.contacts, function (doc) {
          return doc.contact.toString() == value.contact;
        });
        if (findRst.length == 0) throw new Error('Contact Not Found');
        var merged = _.merge(findRst[0], value);
        return user.save()
          .then(function () {
            return merged;
          });
      })
      .then(function (contact) {
        res.ok(contact);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            switch (err.message) {
              case 'User Not Found':
                log.verbose('UserController.addContact :: user not found');
                return res.notFound(err.message);
              case 'Contact Not Found':
                log.verbose('UserController.addContact :: contact not found');
                return res.notFound(err.message);
            }
            break;
          case 'CastError':
            return res.notFound(err.message);
        }
        next(err);
      });
  },

  /**
   * 删除联系人
   */
  deleteContact: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id,
        cid = req.params.cid;

    User.findOne({ _id: id })
      .select('contacts')
      .then(function (user) {
        if (user) return user;
        throw new Error('User Not Found');
      })
      .then(function (user) {
        var findRst = _.filter(user.contacts, function (doc) {
          return doc.contact.toString() != cid;
        });
        user.contacts = findRst;
        return user.save();
      })
      .then(function () {
        res.ok();
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            switch (err.message) {
              case 'User Not Found':
                log.verbose('UserController.addContact :: user not found');
                return res.notFound(err.message);
            }
            break;
          case 'CastError':
            return res.notFound(err.message);
        }
        next(err);
      });
  },

  /**
   * 获取用户联系人
   */
  getContact: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id,
        cid = req.params.cid,
        populate = req.query.populate;

    var query = User.findOne({ _id: id })
      .select('contacts');

    if (populate) {
      query = query.populate('contacts.contact');
    }

    query.lean()
      .then(function (user) {
        if (user) return user.contacts;
        throw new Error('User Not Found');
      })
      .then(function (contacts) {
        contacts = _.filter(contacts, function (doc) {
          return populate ? doc.contact._id.toString() == cid :
                            doc.contact.toString() == cid;
        });
        if (contacts.length) return contacts[0];
        throw new Error('Contact Not Found');
      })
      .then(function (contact) {
        res.ok(contact);
      })
      .catch(function (err) {
        switch (err.name) {
          case 'Error':
            switch (err.message) {
              case 'User Not Found':
                log.verbose('UserController.getContact :: user not found');
                return res.notFound(err.message);
              case 'Contact Not Found':
                log.verbose('UserController.getContact :: contact not found');
                return res.notFound(err.message);
            }
            break;
          case 'CastError':
            return res.notFound(err.message);
        }
        next(err);
      });
  },

};
