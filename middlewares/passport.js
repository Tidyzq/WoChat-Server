var passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    jwtStrategy = require('passport-jwt').Strategy,
    extractJwt = require('passport-jwt').ExtractJwt,
    bcrypt = require('bcrypt');

var passportConfig = app.get('passport');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  app.models.User.findOne({ id: id } , function (err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {



    app.models.User.findOne({ username: username })
      .lean()
      .select('+password')
      // 检查用户是否存在
      .then(function (user) {
        if (!user)
          throw new Error('No Such User.');
        return user;
      })
      // 检查用户密码是否正确
      .then(function (user) {
        return bcrypt.compare(password, user.password)
          .then(function (res) {
            if (!res)
              throw new Error('Invalid Password.');
            return user;
          });
      })
      // 验证完成，返回用户信息
      .then(function (user) {
        done(null, user);
      })
      // 验证失败，返回错误信息
      .catch(function (err) {
        done(err);
      });
  }
));

passport.use(new jwtStrategy(
  {
    secretOrKey: passportConfig.jwt.secret,
    jwtFromRequest: passportConfig.jwt.extractor,
  }, function (payload, done) {
    var user = payload.user;
    app.models.User.findOne({ id: user.id })
      .then(function (user) {
        if (!user)
          throw new Error('No Such User.');
        return user;
      })
      .then(function (user) {
        done(null, user, {});
      })
      .catch(done);
    // done(null, user, {});
  }
));

module.exports = passport.initialize();