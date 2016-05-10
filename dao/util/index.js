'use strict'


var mongoose = require('mongoose'),
    connections = require("../connections");

  var options = {
    versionKey: false,          /* no version key on sub-objects */
    collection: "serials"
  };

var serialSchema = mongoose.Schema({
  Name: String,
  Counter: {type:Number, required:true}
}, options)

var serialModel = connections.util.model("Serial", serialSchema);

module.exports = {
  models:{
    Serial:serialModel
  }
}
