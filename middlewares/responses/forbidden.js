module.exports = function (data) {

  data = data || '403 (Forbidden)';

  this.status(403).json(data);
};