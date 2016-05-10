'use strict'

var mongoose = require('mongoose'),
    connections = require("../connections");

var ObjectId  = mongoose.Schema.Types.ObjectId;

  var options = {
    versionKey: false,          /* no version key on sub-objects */
    collection: "items"
  };

var fileSchema = mongoose.Schema({
  Created: {type:Date, required: true},
  DocumentId: {type: ObjectId, required: true},
  FileName: {type: String, required: true},
  FileSize: {type: Number, required: true}
}, options)

var fileModel = connections.util.model("File", fileSchema);

module.exports = {
  models:{
    File:fileModel
  }
}
