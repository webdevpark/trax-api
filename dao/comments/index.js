'use strict'


var mongoose = require('mongoose'),
    connections = require("../connections"),
    common = require('../jobs/common');

var ObjectId  = mongoose.Schema.Types.ObjectId;

var options = {
  versionKey: false,          /* no version key on sub-objects */
  collection: "comments"
};

var commentSchema = mongoose.Schema({
  Created: {type: common.schemas.UserDate},
  Deleted: {type:common.schemas.UserDate},
  JobId: {type: ObjectId},
  Text: String,
}, options)

var commentModel = mongoose.model("Comment", commentSchema);

module.exports = {
  models:{
    Comment:commentModel
  }
}
