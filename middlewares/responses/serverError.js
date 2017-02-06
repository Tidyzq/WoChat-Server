module.exports = function (data) {

  data = data || '500 (Server Error)';

  this.status(500).json(data);
};