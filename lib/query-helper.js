"use strict"
/**
 * Common job object helper
 * @module lib/job-helper.js
 */

var Q   = require('q'),
    owl = require('owl-deepcopy'),
    dao = require('../dao'),
    fm        = require('fm-api-common'),
    logger    = fm.logger;

var ActivityBase = dao.jobs.models.ActivityBase;
var ActivityBaseArchive = dao.jobs.models.archive.ActivityBase;

module.exports = {
  /**
   * Performs a customerjob query on the hot and archive store
   * @func queryJobStores
   * @param query {Object} The query
   */
  queryJobStores: function (fQuery, isSingleResult) {
    return Q.spread([fQuery(ActivityBase), fQuery(ActivityBaseArchive)], function(hotResults, archiveResults){
      if (isSingleResult) {
        //prefer results from active store
        return hotResults ? hotResults : archiveResults;
      } else {
        return hotResults.concat(archiveResults);
      }
    });
  },

  sortByCreated: function(a, b){
    if (a.Created.When == b.Created.When) {
      return 0;
    }
    return a.Created.When < b.Created.When ? -1 : 1;
  },
  sortByCreatedDesc: function(a, b) {
    return module.exports.sortByCreated(a, b) * -1;
  }
}
