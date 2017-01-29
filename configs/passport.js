var extractJwt = require('passport-jwt').ExtractJwt;

var cookieExtractor = function (cookieName) {
  return function (req) {
    var token = null;
    if (req && req.cookies) {
      token = req.cookies[cookieName];
    }
    return token;
  }
}

module.exports.passport = {

  jwt: {

    expiresIn: '7d', // 7 days
    secret: '22588c157798ef5a0462d33a670cab23', // random key
    algorithm : 'HS256',
    // issuer : 'tidyzq.com',
    // audience : 'tidyzq.com',

    // jwt 验证要使用的提取器，验证过程会逐一尝试提取
    extractor: extractJwt.fromExtractors([
      // 从 Authorization 头提取
      extractJwt.fromAuthHeader(),
      // 从 URL 的 query 参数提取
      extractJwt.fromUrlQueryParameter('access_token'),
      // 从 cookie 提取
      cookieExtractor('jwt'),
    ]),

  },

}