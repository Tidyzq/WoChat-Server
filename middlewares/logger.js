module.exports = function (req, res, next) {
  function afterResponse() {
      res.finished = true;

      res.removeListener('finish', afterResponse);
      res.removeListener('close', afterResponse);

      req.endTime = new Date();
      var duration = req.endTime.getTime() - req.startTime.getTime();
      log.verbose(res.statusCode, req.originalUrl, '-', duration, 'ms');
  }

  if (!res.finished) {
    res.on('finish', afterResponse);
    res.on('close', afterResponse);

    req.startTime = new Date();
  }

  next();
};