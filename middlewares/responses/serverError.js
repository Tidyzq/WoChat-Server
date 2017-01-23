module.exports = function (data) {

  console.error(data);

  // Set status code
  this.status(500);

  return this.jsonx(data);
};