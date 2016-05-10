"use strict"

var fm          = require('fm-api-common'),
    logger      = fm.logger,
    Q           = require('q'),
    _           = require('lodash'),
    mongoose    = require('mongoose'),
    restify     = require('restify'),
    dao         = require('../dao'),
    jobHelper   = require('../lib/job-helper'),
    TraxClient  = require('../lib/client').TraxClient,
    queryHelper = require('../lib/query-helper'),
    moment      = require('moment');

var ActivityBase  = dao.jobs.models.ActivityBase,
    CustomerJob   = dao.jobs.models.CustomerJob,
    ObjectId      = mongoose.Types.ObjectId;

var ReportRoutes = function(){};

ReportRoutes.prototype.byIdentity = function(req, res, next){
  if (!req.params.idt) {
    return next(new restify.MissingParameterError("Identity Type is required"));
  }
  if (!req.params.id) {
    return next(new restify.MissingParameterError("Identity value is required"));
  }
  if (!dao.jobs.common.schemas.IdentitySet.path(req.params.idt)) {
    return next(new restify.InvalidArgumentError(`Identity type ${req.params.idt} is not recognized`));
  }
  logger.info(`finding jobs with ${req.params.idt} = ${req.params.id}`);

  let identityType = "Identities." + req.params.idt;
  var query = {};
  query[identityType] = req.params.id;
  return queryHelper.queryJobStores(function(store){

    return store
      .find(query)
      .exec();
  })
    .then(function(result){
      result = result.sort(queryHelper.sortByCreatedDesc);
      res.send(200, result);
      next();
    })
    .catch(function(e){
      next(e)
    });
}

ReportRoutes.prototype.jobExistsForIdentity  = function(req, res, next) {
    if (!req.params.idt) {
      return next(new restify.MissingParameterError("Identity Type is required"));
    }
    if (!req.params.id) {
      return next(new restify.MissingParameterError("Identity value is required"));
    }
    if (!dao.jobs.common.schemas.IdentitySet.path(req.params.idt)) {
      return next(new restify.InvalidArgumentError(`Identity type ${req.params.idt} is not recognized`));
    }
    logger.info(`checking if any jobs exists with ${req.params.idt} = ${req.params.id}`);
    let identityType = "Identities." + req.params.idt;
    let jobTypeId = parseInt(req.query.jt);
    let completed = req.query.c === "true";

    var query = {};
    query[identityType] = req.params.id;
    if( jobTypeId) {
      query["JobType.JobTypeId"] = jobTypeId;
    }
    if (!completed) {
      query.Completed = null;
      query.Closed = null;
    }

    return queryHelper.queryJobStores(function(store){
      return store.find(query);
    })
    .then(function(result){
      res.send(200, result && result.length > 0);
      next();
    })
    .catch(next)
    .done();
}

ReportRoutes.prototype.closureCountByUser = function(req, res, next) {

  var start = moment.utc(req.params.start);
  var end = moment.utc(req.params.end);

  if (!start.isValid()) {
    return next(new restify.InvalidArgumentError('start date parameter is not in a valid date format'));
  }
  if (!end.isValid()) {
    return next(new restify.InvalidArgumentError('end date parameter is not in a valid date format'));
  }
  return queryHelper.queryJobStores(function(store){
    return store
      .aggregate({
        $match: {
          "Completed.When": {
            $gt:start.toDate(),
            $lt:end.toDate()
          }
        }
      }, {
        $group: {
          _id:"$Completed.Who.EmailAddress",
          count: {$sum:1}
        }
      })
      .exec();
  })
    .then(function(result){
      var sanitised = []
      if (result && Array.isArray(result)) {
        result.forEach(function(item, index) {
          if (item._id != null) {
            sanitised.push(item);
          }
        });
        sanitised.sort(function(a,b){
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        })
      }
      res.send(200, sanitised);
    })
    .catch(function(e){
      next(e);
    });
}

ReportRoutes.prototype.closures = function(req, res, next){

  let jobType = req.query.jt;
  let tontoUserId = req.query.tuId;
  let emailAddress = req.query.email;
  let start = req.query.start;
  let end = req.query.end;

  var queryClauses = [];
  queryClauses.push(
  {
    $or:[
      {Completed: {$ne:null}},
      {Closed: {$ne:null}}
    ]
  });
  if (jobType) {
    jobType = parseInt(jobType);
    if (isNaN(jobType)) {
      return next(new restify.InvalidArgumentError('jt parameter is not in a valid integer format'));
    }
    queryClauses.push({
      "JobType.JobTypeId": jobType
    });
  }

  if (tontoUserId) {
    tontoUserId = parseInt(tontoUserId);
    if (isNaN(tontoUserId)) {
      return next(new restify.InvalidArgumentError('tuId parameter is not in a valid integer format'));
    }
    queryClauses.push({
      $or:[
        {"Completed.Who.TontoUserId": tontoUserId},
        {"Closed.Who.TontoUserId": tontoUserId}
      ]
    });
  }

  if (emailAddress) {
    queryClauses.push({
      $or:[
        {"Completed.Who.EmailAddress": emailAddress},
        {"Closed.Who.EmailAddress": emailAddress}
      ]
    });
  }

  if (req.params.start || req.params.end) {

    if (req.params.start !== undefined) {
      start = moment.utc(req.query.start);
    }
    if (req.params.end !== undefined) {
      end = moment.utc(req.query.end);
    }

    if (start != null && !start.isValid()) {
      return next(new restify.InvalidArgumentError('start date parameter is not in a valid date format'));
    }
    if (end != null && !end.isValid()) {
      return next(new restify.InvalidArgumentError('end date parameter is not in a valid date format'));
    }

    var completedInDateRangeQuery =
      start == null ? {"Completed.When":{$lt: end}} :
      end == null ? {"Completed.When":{$gt: start}} :
      {
        $and:[
          {"Completed.When":{$gt: start}},
          {"Completed.When":{$lt: end}}
        ]
      };
    var closedInDateRangeQuery =
      start == null ? {"Closed.When":{$lt: end}} :
      end == null ? {"Closed.When":{$gt: start}} :
      {
        $and:[
          {"Closed.When":{$gt: start}},
          {"Closed.When":{$lt: end}}
        ]
      };
    queryClauses.push({
      $or:[
        completedInDateRangeQuery,
        closedInDateRangeQuery
      ]
    });
  }

  return queryHelper.queryJobStores(function(store){
    return store
      .find({
        $and:queryClauses
      });
  })
  .then(function(result){
    res.send(200, result);
  })
  .catch(next);
}

ReportRoutes.prototype.byUser = function(req, res, next){
  let page = parseInt(req.params.p);
  let pageSize = parseInt(req.params.ps);
  let user = jobHelper.makeUser(req.user);

  return ActivityBase.find({
      "Closed": null,
      "Assigned.Who.EmailAddress": user.EmailAddress
    })
    .sort("-Created.When")
    .skip(pageSize * page)
    .limit(pageSize)
    .then(userJobs => {
        res.send(200, userJobs.map(job => job.toObject()))
        next();
    })
    .catch(next)
    .done();
}

module.exports = new ReportRoutes();
