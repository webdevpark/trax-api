"use strict"

/*
// Trigger an HTTP error
// The built-in restify errors are: RestError, BadDigestError, BadMethodError,
                                    InternalError, InvalidArgumentError, InvalidContentError,
                                    InvalidCredentialsError, InvalidHeaderError, InvalidVersionError,
                                    MissingParameterError, NotAuthorizedError, RequestExpiredError,
                                    RequestThrottledError, ResourceNotFoundError, WrongAcceptError
// The core thing to note about an HttpError is that it has a numeric code (statusCode) and a body. The statusCode will automatically set the HTTP response status code, and the body attribute by default will be the message.
*/

var fm        = require('fm-api-common'),
    logger    = fm.logger,
    Q         = require('q'),
    _         = require('lodash'),
    mongoose  = require('mongoose'),
    restify   = require('restify'),
    dao       = require('../dao'),
    ObjectId  = mongoose.Types.ObjectId,
    moment    = require('moment');

var jobHelper    = require('../lib/job-helper'),
    queryHelper  = require('../lib/query-helper'),
    filesHelper  = require('../lib/files-helper'),
    formatHelper = require('../lib/format-helper'),
    TraxClient   = require('../lib/client').TraxClient,
    RecurringJob = dao.recurring.models.RecurringJob,
    ActivityBaseArchive = dao.jobs.models.archive.ActivityBase;


/**
 * comment class module
 * @class RecurringRoutes
 */
var RecurringRoutes = function () { };

/**
 * creates a recurring job if id not provided, otherwise updates an existing recurring job
 * @func upsert
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
RecurringRoutes.prototype.upsert = function (req, res, next) {
  var currentUser = jobHelper.makeUser(req.user);

  let job = req.body;
  let work = [];
  let modelType = null;
  let isNew = !Boolean(job._id);
  if (job.JobTemplate && job.JobTemplate.JobType) {
    work.push(dao.ctrl.JobType.findOne({ where: { iD: job.JobTemplate.JobType.JobTypeId }})
    .then(jt => {
      job.JobTemplate.JobType.Description = jt.description;
      job.JobTemplate.JobType.TypeCode = jt.typeCode;

      modelType = jt.modelType;
    }));
  }
  if (job.Schedule.Assignee && job.Schedule.Assignee.EmailAddress) {
    work.push(dao.ctrl.User.findOne({where: {emailAddress: job.Schedule.Assignee.EmailAddress}})
      .then(u => {
        job.Schedule.Assginee.Name = u.fullName;
        job.Schedule.Assignee.TontoUsereId = u.tontoUserID
      }));
  }
  return Q.all(work)
    .then(() => {
      let work = [];

      if (job.JobTemplate._id) {
        return ActivityBaseArchive.findOne({_id:job.JobTemplate._id})
          .then(existingJobTemplate => {
            Object.assign(job.JobTemplate, existingJobTemplate);
            return existingJobTemplate.save();
          })
      } else {
        let jobTemplate = dao.jobs.factory(modelType, job.JobTemplate, true);
        return jobTemplate.save();
      }
    })
    .then(jobTemplate => {
      job.JobTemplateId = jobTemplate._id;
      if (job._id) {
        return RecurringJob.findOne({_id:job._id})
          .then(existingRecurringJob => {
            existingRecurringJob.Schedule = job.Schedule;
            existingRecurringJob.JobTemplateId = jobTemplate._id;
            return existingRecurringJob.save();
          })
      } else {
        let recurringJob = new RecurringJob({
          Schedule : job.Schedule,
          Created :{
            User:  jobHelper.makeUser(req.user),
            When: new Date()
          },
          JobTemplateId : jobTemplate._id
        });
        var errs = recurringJob.validateSync();
        return recurringJob.save()
      }
    })
    .then(recurringJob => {
      res.send(isNew ? 201 : 200, recurringJob.toObject())
    })
    .catch(next)
    .done()

}

/**
 * deletes a recurring job
 * @func delete
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
RecurringRoutes.prototype.delete = function(req, res, next){
  let id = req.params.id;
  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }
  return RecurringJob.findOne({_id:id})
    .then(recurringJob => {
      if (!recurringJob) {
        return next(new restify.ResourceNotFoundError(`could not find recurring job with id ${req.params.id}`));
      }
      return recurringJob.remove();
    })
    .then(function(recurringJob){
      res.send(204);
    })
    .catch(next)
    .done();
}

/**
 * retrieves a recurring job
 * @func retrieve
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
RecurringRoutes.prototype.retrieve = function(req, res, next){
  let id = req.params.id;
  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }
  return RecurringJob.findOne({_id:id})
    .then(function(recurringJob){
      if (!recurringJob) {
        return next(new restify.ResourceNotFoundError(`could not find recurring job with id ${req.params.id}`));
      }
      return ActivityBaseArchive.findOne({_id:recurringJob._id})
        .then(jobTemplate => {
          let ret = recurringJob.toObject();
          ret.JobTemplate = jobTemplate;
          return ret
        })
    })
    .then(recurringJob => {
      res.send(200, recurringJob);
    })
    .catch(next)
    .done();
}

/**
 * retrieves all recurring jobs
 * @func list
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
RecurringRoutes.prototype.list = function(req, res, next){
  
  return RecurringJob.find(
    {},
    null,
    {sort: "-Created.When"}
  )
    .then(function(list){
      res.send(200, list);
    })
    .catch(next)
    .done();
}

module.exports = new RecurringRoutes();
