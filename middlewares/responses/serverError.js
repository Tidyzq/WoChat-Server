module.exports = function (data) {

  // Set status code
  this.status(500);

  return this.json(data);
};