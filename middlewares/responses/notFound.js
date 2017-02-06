module.exports = function (data) {

  data = data || '404 (Not Found)';

  this.status(404).json(data);
};