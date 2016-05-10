"use strict"

var schemas = require('./schemas'),
  mongoose = require('mongoose'),
  connections = require("../connections");

var activityBase = mongoose.model('ActivityBase', schemas.ActivityBase);
var activityBaseArchive = connections.archive.model('ActivityBase', schemas.ActivityBase);

module.exports.ActivityBase = activityBase;
module.exports.archive = {
  ActivityBase: activityBaseArchive
};

var modelNames = [];
Object.keys(schemas.definitions).forEach(function(key, index){
  if (key !== "ActivityBase") {
    modelNames.push(key);
  }
})

modelNames.forEach(function(modelName){
  var archiveSchema = schemas.archive[modelName];
  module.exports[modelName] = activityBase.discriminator(modelName, schemas[modelName]);

  module.exports.archive[modelName] = activityBaseArchive.discriminator(modelName, archiveSchema);
});
