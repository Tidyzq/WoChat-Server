module.exports = {

  /**
   * 收取信息
   */
  receive: function (req, res, next) {
    var Message = app.models.Message,
        utils = app.services.utils;
        id = req.params.id || req.user._id,
        sort = req.query.sort ? _.split(req.query.sort, ',') : [],
        skip = req.query.skip || 0,
        limit = req.query.limit || 30;

    Message.find({ sender: id })
      .lean()
      .then(utils.sort(sort))
      .then(utils.slice(skip, limit))
      .then(function (messages) {
        res.ok(messages);
      })
      .catch(function (err) {
        next(err);
      });
  },

  /**
   * 发送信息
   */
  send: function (req, res, next) {
    var Message = app.models.Message,
        value = req.body;

    value.sender = req.user._id;

    Message.create(value)
      .then(function (message) {
        res.ok(message.toObject());
      })
      .catch(function (err) {
        switch (err.name) {
          case 'ValidationError':
            log.verbose('MessageController.send :: validation error');
            return res.badRequest(error.message);

        }
        next(err);
      });
  },

};