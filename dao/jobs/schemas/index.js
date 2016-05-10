"use strict"

var definitions = {};
require('./base');
var mongoose = require('mongoose'),

  reqs = require('require-all')({
    dirname: __dirname,
    excludeDirs: __dirname + '/index.js',
    recursive:true,
    resolve:function(e){
      Object.keys(e).forEach(function(key, index){
        if (key.endsWith("Fields")) {
          // e.g. CustomerJobFields: [Obect] -> add to definitions as CustomerJob: [Object]
          definitions[key.substring(0, key.length - "Fields".length)] = e[key];
        }
      });
    }
  });

var options = {
  discriminatorKey: '_t',     /* inheritance to use _t */
  versionKey: false,          /* no version key on sub-objects */
  collection: "items"
};
module.exports.archive = {};
Object.keys(definitions).forEach(function(definitionName){
  module.exports[definitionName] = mongoose.Schema(definitions[definitionName], options);
  module.exports.archive[definitionName] = mongoose.Schema(definitions[definitionName], options);
});

module.exports.definitions = definitions;
