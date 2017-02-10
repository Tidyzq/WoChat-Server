var mongoose = require('mongoose');
// var V = require('../utils/validator');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var messageSchema = new Schema({
    // _id: ObjectId,
    sender: {
      type: ObjectId,
      required: true,
      ref: 'User',
      // validate: V.id
    },
    receiver: {
      type: ObjectId,
      required: true,
      // validate: V.id
    },
    to_group: {
      type: Boolean,
      required: true,
      default: false,
    },
    time: {
      type: Date,
      required: true,
      default: Date.now,
      // validate: V.time
    },
    type: {
      type: Number,
      required: true,
      default: 0,
      // validate: V.messageType
    },
    content: {
      type: String,
      required: true,
      // validate: V.messageContent
    },
    unread: {
      type: [
        { type: ObjectId, required: true, ref: 'User' }
      ],
      select: false,
    }
}, {
    versionKey: false
});

messageSchema.pre('save', function (next) {
  var socket = app.socket,
      msg = this;
  socket.to(msg.receiver.toString()).emit('message', [msg]);
  next();
});

var Message =  module.exports = mongoose.model('Message', messageSchema);