var _config = app.get('http').accessControl;

module.exports = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', _config.allowOrigin);
  res.header("Access-Control-Allow-Headers", _config.allowHeaders);
  res.header("Access-Control-Allow-Methods", _config.allowMethods);
  if (req.method == 'OPTIONS') {
    res.ok();
  } else {
    next();
  }
};