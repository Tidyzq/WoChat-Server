var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
// var bodyParser = require('body-parser');

module.exports.middleware = {

  order: [
    // 'favicon',
    'logger',
    'response',
    'cookieParser',
    // 'bodyParserJson',
    // 'bodyParserUrl',
    'skipper',
    'passport',
    'powerdBy',
    'static',
    'router',
    '404',
    '500',
  ],

  // favicon: favicon(path.join(app.get('path'), 'public', 'favicon.ico')),

  // bodyParserJson: bodyParser.json({ limit: '50mb' }),

  // bodyParserUrl: bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }),

  cookieParser: require('cookie-parser')(),

  skipper: require('skipper')({}),

  static: express.static('./public'),

};