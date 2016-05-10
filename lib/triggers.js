/**
 * Trigger client module
 * @module trigger
 */

var Q       = require('q'),
    logger  = require('fm-api-common').logger,
    config  = require('config');

var TriggerClient = function () { };

TriggerClient.prototype.invokeForJobId = function (tense, trigger, id) {
  // TODO: read the job record out of the database for the id
  // supplied
  var job = { };

  // invoke the trigger set
  return this.invokeForJob(tense, trigger, job);
};

TriggerClient.prototype.invokeForJob = function (tense, trigger, job) {
  return Q.fcall(function () { });
};

module.exports = new TriggerClient();