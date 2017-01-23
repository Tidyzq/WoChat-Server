var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var response = require('../middlewares/response');

module.exports.middleware = {

  order: [
    // 'favicon',
    'response',
    'logger',
    'bodyParserJson',
    'bodyParserUrl',
    'cookieParser',
    'static'
  ],

  // favicon: favicon(path.join(app.get('path'), 'public', 'favicon.ico')),

  response: response,

  logger: logger('dev'),

  bodyParserJson: bodyParser.json(),

  bodyParserUrl: bodyParser.urlencoded({ extended: false }),

  cookieParser: cookieParser(),

  static: express.static(path.join(app.get('path'), 'public')),

};