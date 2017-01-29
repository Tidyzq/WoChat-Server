module.exports = {

  sort: function (config) {
    config = config || '';
    config = _.split(config, ',');
    var reg = /^(\+|\-)?([^\+\-]*)$/;
    config = _.map(config, function (keyAttr) {
      var match = reg.exec(keyAttr);
      var symbol = match[1], key = match[2];
      return {
        order: symbol == '-' ? 'desc' : 'asc',
        key: key,
      };
    });
    var key = _.map(config, 'key'), order = _.map(config, 'order');
    return function (arr) {
      return _.orderBy(arr, key, order);
    };
  },

  slice: function (skip, limit) {
    skip = skip ? _.toInteger(skip) : 0;
    limit = limit ? _.toInteger(limit) : 30;
    var end = skip + limit;
    return function (arr) {
      return _.slice(arr, skip, end);
    };
  },

};