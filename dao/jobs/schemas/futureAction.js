/**
 * Approval job structures
 * @module dao/jobs/approval
 */
 var extend = require('extend'),
     owl = require('owl-deepcopy'),
     base     = require('./base');

module.exports = {
  FutureActionJobFields: extend(owl.deepCopy(base.CustomerJobFields), {
    FutureActionDate  : Date
  })
}
