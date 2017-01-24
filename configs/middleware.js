var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

module.exports.middleware = {

  order: [
    // 'favicon',
    'response',
    'logger',
    'bodyParserJson',
    'bodyParserUrl',
    'cookieParser',
    'passport',
    'powerdBy',
    'static',
    'router',
    '404',
    '500',
  ],

  // favicon: favicon(path.join(app.get('path'), 'public', 'favicon.ico')),

  bodyParserJson: bodyParser.json(),

  bodyParserUrl: bodyParser.urlencoded({ extended: false }),

  cookieParser: cookieParser(),

  static: express.static('./public'),

};