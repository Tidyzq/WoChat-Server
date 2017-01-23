var Promise = require('bluebird'),
    path = require('path'),
    includeAll = require('include-all');

var responses = includeAll({
  dirname: path.join(__dirname, 'responses'),
  filter: /(.+)\.js$/,
});

module.exports = function (req, res, next) {
  for (var responseName in responses) {
    res[responseName] = responses[responseName];
  }
  next();
};