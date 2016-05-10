'use strict'


var mongoose = require('mongoose'),
    connections = require("../connections"),
    messageTypes = require("./message-types"),
    common = require('../jobs/common');

var ObjectId  = mongoose.Schema.Types.ObjectId;

var options = {
  versionKey: false,          /* no version key on sub-objects */
  collection: "messages"
};

Object.freeze(messageTypes);

var messageSchema = mongoose.Schema({
  Sent: {type: common.schemas.UserDate},
  Recipient: {type:common.schemas.User},
  Delivered:{type:common.schemas.UserDate},
  Acknowledged: {type:common.schemas.UserDate},
  Retracted: {type:common.schemas.UserDate},
  Expiry: String,
  Persistent: {type:Boolean, required:true},
  TypeOfMessage: {type:Number, required: true},
  Subject: String,
  Body: String,
  JobId: {type: ObjectId}
}, options)

var messageModel = mongoose.model("Message", messageSchema);

module.exports = {
  models:{
    Message:messageModel
  },
  constants:{
    MessageTypes: messageTypes
  }
}
