"use strict"
/**
 * Trax client api
 * @module lib/client
 */

var Q       = require('q'),
    restify = require('restify'),
    config  = require('config');

/**
 * Creates a trax client
 * @func TraxClient
 * @param opts {Object} Client construction options
 */
var TraxClient = function (opts) {
  this.conf = config.get('trax-api-client');

  this._client = restify.createJsonClient({
    url: this.conf.url,
    version: '*',
    rejectUnauthorized: false
  });

  /* extract the authorization header out of the request as
     we'll pass this down the chain to api's that require
     authentication */
  this.token = opts.token;
};

var traxClientCallback = function(resolve, reject) {

    return function(err, req, res, obj) {

    // finish up with error
    if (err) {
      return reject(err); }

    return resolve({
      res: res,
      body: obj
    });

  }
}

/**
 * Create a job
 * @func createJob
 * @param req {Object} Request parameters
 */
TraxClient.prototype.createJob = function (req) {

  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.post('/job', req, traxClientCallback(resolve, reject));

  });

};


/**
 * Create a job
 * @func createJob
 * @param req {Object} Request parameters
 */
TraxClient.prototype.createAndRetrieveJob = function (req) {

  var self = this;

  return self.createJob(req).then(function(res){
    return self.retrieve(res.body.id);
  });

};

/**
 * Puts a job on hold
 * @func putJobOnHold
 * @param req {Object} Request parameters
 */
TraxClient.prototype.putJobOnHold = function (id, req) {

  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.put(`/job/${id}/hold`, req, traxClientCallback(resolve, reject));

  });

};

/**
 * Take job off hold
 * @func takeJobOffHold
 * @param req {Object} Request parameters
 */
TraxClient.prototype.takeJobOffHold = function (id, req) {

  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.put(`/job/${id}/off-hold`, req, traxClientCallback(resolve, reject));

  });

};

/**
 * Complete a job
 * @func takeJobOffHold
 * @param req {Object} Request parameters
 */
TraxClient.prototype.completeJob = function (id, req) {

  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.put(`/job/${id}/complete`, req, traxClientCallback(resolve, reject));

  });

};

/**
 * Close a job
 * @func closeJob
 * @param req {Object} Request parameters
 */
TraxClient.prototype.closeJob = function (id, req) {

  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.put(`/job/${id}/close`, req, traxClientCallback(resolve, reject));

  });

};

/**
 * Reassign a job
 * @func reassignJob
 * @param req {Object} Request parameters
 */
TraxClient.prototype.reassignJob = function (id, req) {

  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.put(`/job/${id}/reassign`, req, traxClientCallback(resolve, reject));

  });

};

TraxClient.prototype.retrieve = function(id, archive) {
  var self = this;

  return Q.Promise((resolve, reject, progress) => {
    let url = archive ? `/job/${id}?archive=true` : `/job/${id}`;
    self._client.get(url, traxClientCallback(resolve, reject));

  });
}

TraxClient.prototype.attachment = function(id) {
  var self = this;

  return Q.Promise((resolve, reject, progress) => {
    self._client.post(`/job/${id}/attachment`, traxClientCallback(resolve, reject));
  });
}

TraxClient.prototype.update = function(id, req) {
  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.put(`/job/${id}`, req, traxClientCallback(resolve, reject));

  });
}

TraxClient.prototype.latestEvent = function() {
  var self = this;

  return Q.Promise((resolve, reject, progress) => {

    self._client.get(`/event/latest`, traxClientCallback(resolve, reject));

  });
}

module.exports.TraxClient = TraxClient;
