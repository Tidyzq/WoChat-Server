var passport = require('passport'),
    path = require('path');

module.exports = {

  /**
   * 检查是否是用户自身
   */
  isSelf: function (req, res, next) {
    if (req.user && req.params.id && req.user == req.params.id) {
      return next();
    }
    log.verbose('UserController.isSelf :: unauthorized');
    res.unauthorized();
  },

  /**
   * 获取用户信息
   */
  findUser: function (req, res, next) {
    var User = app.models.User,
        id = req.params.id;
        select = '';

    if (req.query.contacts)
      select += ' +contacts';
    if (req.query['chat_groups'])
      select += ' +chat_groups';

    // 如果设置了 contacts 或 chat_groups 则需要为用户本人
    if (!_.isEmpty(select) && (!req.user || req.user != req.params.id)) {
      log.verbose('UserController::findUser not user self');
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
        log.verbose('UserController::findUser', err.message);
        res.notFound(err.message);
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
        log.verbose('UserController.update ::', err.message);
        res.badRequest(req.message);
      });
  },

  /**
   * 上传头像
   */
  uploadAvatar: function (req, res, next) {
    var User = app.models.User,
        imageService = app.services.image,
        id = req.params.id,
        savePath = path.join(app.get('path'), app.get('image').path),
        staticPath = path.join(app.get('path'), app.get('static'));

    Promise.resolve(req)
      .then(imageService.saveImage('avatar', savePath))
      .then(imageService.generateUrl(staticPath))
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
        log.verbose('UserController::uploadAvatar', err.message);
        err.badRequest(err.message);
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
        log.verbose('UserController::getContacts', err.message);
        res.notFound(err.message);
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
        log.verbose('UserController.addContact ::', err.message);
        res.badRequest(err.message);
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
        log.verbose('UserController.addContact ::', err.message);
        res.notFound(err.message);
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
        log.verbose('UserController.addContact ::', err.message);
        res.badRequest(err.message);
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
        log.verbose('UserController.deleteContact ::', err.message);
        res.notFound(err.message);
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
        log.verbose('UserController.getContact ::', err.message);
        res.notFound(err.message);
      });
  },

};
