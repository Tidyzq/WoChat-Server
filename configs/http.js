module.exports.http = {

  middlewares: [
    'logger',
    'response',
    'cookieParser',
    'bodyParser',
    'passport',
    'powerdBy',
    // 'favicon',
    'static',
    'router',
    '404',
    '500',
  ],

};