module.exports.token = {

  accessTokenExpires: '2h', // 2 hours

  accessTokenType: 'access',

  refreshTokenExpires: '7d', // 7 days

  refreshTokenType: 'refresh',

  secret: '22588c157798ef5a0462d33a670cab23', // random key

  algorithm: 'HS256',

  // issuer : 'tidyzq.com',

  // audience : 'tidyzq.com',

  headerField: 'authorization',

  headerScheme: 'JWT',

};