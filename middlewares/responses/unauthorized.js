module.exports = function (data) {

  data = data || '401 (Unauthorized)';

  this.status(401).json(data);
};