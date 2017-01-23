var path = require('path');

module.exports = {

  port: 1337,

  views: path.join(app.get('path'), 'views'),

  'view engine': 'pug',

};