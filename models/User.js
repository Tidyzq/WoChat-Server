var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
// var V = require('../utils/validator');
// var config = require('../utils/config');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var contactSchema = new Schema(
  {
    contact: {
      type: ObjectId,
      required: true,
      ref: 'User',
      // validate: V.id
    },
    remark: {
      type: String,
      required: false,
      // validate: V.remark
    },
    block_level: {
      type: Number,
      default: 0,
      required: true,
      // validate: V.blockLevel
    }
  }, {
    _id: false,
    versionKey: false
  }
);

var chatGroupSchema = new Schema(
  {
    chat_group: {
      type: ObjectId,
      required: true,
      ref: 'ChatGroup',
      // validate: V.id
    },
    block_level: {
      type: Number,
      default: 0,
      required: true,
      // validate: V.blockLevel
    }
  }, {
    _id: false,
    versionKey: false
  }
);

var activitySchema = new Schema({
    activity: {
      type: ObjectId,
      required: true,
      ref: 'Activity',
      // validate: V.id
    }
  }, {
    _id: false,
    versionKey: false
  }
);

var userSchema = new Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // validate: V.username
    },
    nickname: {
      type: String,
      required: true,
      // validate: V.nickname
    },
    password: {
      type: String,
      required: true,
      select: false,
      // validate: V.password
    },
    avatar: {
      type: String,
      default: 'http:localhost/avatar/default.png',
      // default: config.url + '/avatar/default.png',
      required: true,
      // validate: V.avatar
    },
    gender: {
      type: Number,
      default: 0,
      required: true,
      // validate: V.gender
    },
    region: {
      type: Number,
      default: 0,
      required: true,
      // validate: V.region
    },
    contacts: {
      type: [contactSchema],
      select: false,
    },
    chat_groups: {
      type: [chatGroupSchema],
      select: false,
    },
    activities: {
      type: [activitySchema],
      select: false,
    }
}, {
  // _id: false,
  versionKey: false
});

// 创建（注册）和修改用户前，对用户密码加密
var encryptPassword = function (next) {
  var value = this;
  if (value.password) {
    log.verbose('UserModel :: encrypting password');
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(value.password, salt, function(err, hash) {
        if(err) return next(err);
        value.password = hash;
        log.verbose('UserModel :: encrypting succeed');
        next();
      });
    });
  } else {
    next();
  }
};
userSchema.pre('save', encryptPassword);
// userSchema.pre('update', encryptPassword);
// userSchema.pre('findOneAndUpdate', encryptPassword);

module.exports = mongoose.model('User', userSchema);