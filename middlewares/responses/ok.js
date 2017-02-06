module.exports = function (data) {

  data = data || '200 (Ok)';

  this.status(200).json(data);
};