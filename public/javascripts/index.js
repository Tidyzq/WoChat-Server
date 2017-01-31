var io = require('socket.io-client/dist/socket.io.min.js');
var $ = require('jquery/dist/jquery.min.js');

$(function() {

  // Initialize variables
  var $window = $(window);
  var $eventInput = $('.eventInput');
  var $payloadInput = $('.payloadInput');
  var $responseField = $('.responseField');
  var $sendBtn = $('.sendBtn');

  var socket = io();

  socket.on('auth:fail', function (response) {
    console.log(response);
  });

  socket.on('auth:success', function (response) {
    console.log(response);
  });

  socket.on('message', function (response) {
    console.log(response);
  });

  socket.on('need auth', function (response) {
    console.log(response);
  });

  socket.on('ack:success', function (response) {
    console.log(response);
  });

  socket.on('ack:fail', function (response) {
    console.log(response);
  });

  $sendBtn.click(function () {
    var event = $eventInput.val(), payload = JSON.parse($payloadInput.val());
    console.log(event, payload);
    socket.emit(event, payload);
  });

});