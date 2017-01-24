var jwt = require('jsonwebtoken'),
    jwtConfig = app.get('passport').jwt;

module.exports = {

  createToken: function(user) {
    return jwt.sign(
      {
        user: user
      },
      jwtConfig.secret,
      {
        algorithm: jwtConfig.algorithm,
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    )
  },

};