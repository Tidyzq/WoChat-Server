process.chdir(__dirname);

var App = require('./app/index');

var app = new App();

app.start();