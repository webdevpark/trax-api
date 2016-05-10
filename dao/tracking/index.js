'use strict'


var mongoose = require('mongoose'),
    connections = require("../connections"),
    eventTypes = require("./event-types"),
    common = require('../jobs/common');

var ObjectId  = mongoose.Schema.Types.ObjectId;

var options = {
  versionKey: false,          /* no version key on sub-objects */
  collection: "tracking"
};

Object.freeze(eventTypes);

var eventSchema = mongoose.Schema({
  Type:       {type:Number, required:true},
  Who:        {type:common.schemas.User, required: true},
  When:       {type:Number, required: true},
  Duration:   String,
  ActivityId: {type: ObjectId},
  Reason:     String
}, options)

var eventModel = mongoose.model("Event", eventSchema);

module.exports = {
  models:{
    Event:eventModel
  },
  constants:{
    EventTypes: eventTypes
  }
}
