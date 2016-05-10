"use strict"
/**
 * Common job object helper
 * @module lib/job-helper.js
 */

var Q         = require('q'),
    dao       = require('../dao'),
    fm        = require('fm-api-common'),
    logger    = fm.logger;


var ChainHelper = function () { };
/**
 * Creates a user data object from an authentication cookie
 * @func makeUser
 * @param user {Object} The user
 */
ChainHelper.prototype.chainReaction = function (jobId, user, action) {

  return Q();

};
module.exports = new ChainHelper();
