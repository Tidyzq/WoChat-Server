module.exports = function (data) {

  // Set status code
  this.status(404);

  return this.json(data);
};