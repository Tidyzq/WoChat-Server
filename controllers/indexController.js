var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

  index: function (req, res, next) {
    res.render('index', { title: 'Express' });
  },

  /**
   * 处理 id
   */
  processId: function (req, res, next) {
    req.params.id = ObjectId(req.params.id);
    next();
  },

};

