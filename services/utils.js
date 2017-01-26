module.exports = {

  sort: function (config) {
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
    var end = skip + limit;
    return function (arr) {
      return _.slice(arr, skip, end);
    };
  },

};