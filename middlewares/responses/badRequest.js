module.exports = function (data) {

  data = data || '400 (Bad Request)';

  this.status(400).json(data);
};