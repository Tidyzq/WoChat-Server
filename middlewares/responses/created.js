module.exports = function (data) {

  data = data || '201 (Created)';

  this.status(201).json(data);
};