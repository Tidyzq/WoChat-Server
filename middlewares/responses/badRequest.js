module.exports = function (data) {

  // Set status code
  this.status(400);

  return this.json(data);
};