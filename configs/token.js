module.exports.token = {

  types: {
    access: {
      typename: 0,
      expires: '2h',
    },
    refresh: {
      typename: 1,
      expires: '7d',
    },
    invitation: {
      typename: 2,
      expires: '2d',
    },
  },

  secret: '22588c157798ef5a0462d33a670cab23', // random key

  algorithm: 'HS256',

  // issuer : 'tidyzq.com',

  // audience : 'tidyzq.com',

  headerField: 'authorization',

  headerScheme: 'JWT',

};