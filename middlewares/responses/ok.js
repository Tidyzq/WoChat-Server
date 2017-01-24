module.exports = function (data) {

  // Set status code
  this.status(200);

  return this.json(data);
};