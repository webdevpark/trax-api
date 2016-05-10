
var Q = require('q'),
  mongoose = require('mongoose'),
  util = require('../dao/util');

var SerialHelper = function () { };

SerialHelper.prototype.getNext = function(name) {
  return util.models.Serial.findOneAndUpdate(
    {Name: name},
    {$inc: {Counter:1}},
    {
      upsert: true,
      new: true
    }
  );
}

module.exports = new SerialHelper();
