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
    ObjectId  = mongoose.Types.ObjectId;

var jobHelper    = require('../lib/job-helper'),
    queryHelper  = require('../lib/query-helper'),
    filesHelper  = require('../lib/files-helper'),
    TraxClient   = require('../lib/client').TraxClient

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    File         = dao.documents.models.File;

/**
 * Static module to hold all job routes
 * @class JobRoutes
 */
var JobRoutes = function () {};

/**
 * Creates a new job
 * @func create
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.create = function (req, res, next) {

  if (!req.body) {
    return next(new restify.InvalidArgumentError(`No job details were sent`));
  }
  // collect all of the potential parameters for a job creation
  var title       = req.body.Title,
      description = req.body.Description,
      jobTypeId   = req.body.JobTypeId,
      identities  = req.body.Identities,
      message     = req.body.Message,
      reason      = req.body.Reason,
      partitions  = req.body.Partitions,
      priority    = req.body.Priority;

  logger.info('Create job requested');

  // we need job type id
  if (!jobTypeId) {
    return next(new restify.MissingParameterError('JobTypeId is required'));
  }

  return dao.ctrl.JobType.findOne({ where: { iD: jobTypeId }})
    .then(function (jobType) {

      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate a job type with id ${jobTypeId}`));
      }

      var jobData = {
        Identities: identities,
        Partitioning: partitions,

        Title: title || jobType.description,
        Description: description,
        Priority: priority,

        Attachments: [],
        Chain: [],

        Created  : jobHelper.makeMovement(req.user),
        Assigned : null,
        Reserved : null,
        Closed   : null,
        FollowUp : jobHelper.makeMovement(req.user),
        Completed: null,
        OnHold   : null,

        Armed   : false,
        ParentId: null,

        JobType     : {

          JobTypeId: jobType.iD,
          Description: jobType.description,
          TypeCode: jobType.typeCode

        },
        Message     : message,
        Wrapup      : null,
        IsArchived  : false
      };
      /* we build the job record from the specialised (or generalised) type, depdending
         on the model type assigned to the job type in the database */
      let mongoJobRecord = dao.jobs.factory(jobType.modelType, jobData);
      return mongoJobRecord.save()
        .then(function (r) {

          return jobHelper.writeMovement(r._id, 'created', { Who: jobHelper.makeUser(req.user) })
            .then((mv) => {

              // send the user back the id of the newly created job
              res.send(201, { id: r._id });

              return next();

            });

        });

      // the arming process should now be the last trigger to fire
      // at the end of a create

    })
    .catch(next)
    .done();

};

/**
 * Updates the state of a job
 * @func update
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.update = function (req, res, next) {

  var job = req.body,
      id  = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  if (!job) {
    return next(new restify.MissingParameterError(`No job data or id was specified`));
  }

  /* remove attributes from the incoming job record that we don't
     allow remote update on */

  delete job._id;
  delete job.Identities;
  delete job.Partitioning;
  delete job.Attachments;
  delete job.Chain;

  delete job.Created;
  delete job.Assigned;
  delete job.Reserved;
  delete job.Closed;
  delete job.FollowUp;
  delete job.Completed;
  delete job.OnHold;

  delete job.Armed;
  delete job.ParentId;
  delete job.JobType;

  delete job.Message;
  delete job.Wrapup;
  delete job.IsArchived;

  return ActivityBase.findOne({_id: new ObjectId(id)})
    .then(function(curr){
      var updated = Object.assign(curr, job);
      return updated.save();
    })
    .then(function(updated, numUpdated){
      if (numUpdated == 0) {
        return next(new restify.NotFoundError(id));
      } else {
        res.send(200, updated.toObject());
        return next();
      }
    })
    .catch(next)
    .done();

  // return ActivityBase.update({ "_id": new ObjectId(id) }, job)
  //   .then((updateResult) => {
  //
  //     if (updateResult.n == 0) {
  //         return next(new restify.NotFoundError(id));
  //     } else {
  //         res.send(updateResult);
  //         return next();
  //     }
  //
  //   })
  //   .catch(next)
  //   .done();

};

/**
 * Retrieves a job
 * @func retrieve
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.retrieve = function (req, res, next) {
  logger.info('Retrieving job');

  var id = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }
  var findPromise = null
  if (req.query.archive === "true") {
    findPromise = queryHelper.queryJobStores(function(store){
      return store.findById(id);
    }, true);
  } else {
    findPromise = ActivityBase.findById(id);
  }
  return findPromise
    .then((job) => {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      res.send(job);
      return next();

    })
    .catch(next)
    .done();
};

/**
 * Puts a job on hold
 * @func hold
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.hold = function (req, res, next) {

  var id = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (job.Closed || job.Completed) {
        return next(new restify.ConflictError(`This job is in a closed or completed state`));
      }

      var dataJobs = [];

      job.OnHold = jobHelper.makeMovement(req.user);
      var movementPromise = jobHelper.writeMovement(id, 'status', {
        Who: jobHelper.makeUser(req.user),
        Status: dao.refs.activityStatus.ON_HOLD
      }, req.body.Reason, req.body.Wrapup);

      // if a follow up date was given, we need to mark this in the job record
      if (req.body.FollowUp) {
        job.FollowUp = jobHelper.makeMovement(req.user, req.body.FollowUp);

        var followUpMovementPromise = jobHelper.writeMovement(id, 'follow-up', {
          Who: jobHelper.makeUser(req.user),
          FollowUpDue: req.body.FollowUp
        }, req.body.Reason, req.body.Wrapup);

        dataJobs.push(followUpMovementPromise);
      }

      dataJobs.push(movementPromise);
      dataJobs.push(job.save());

      return Q.all(dataJobs)
        .then((results) => {

          res.send({});
          return next();

        });

    })
    .catch(next)
    .done();

};

/**
 * Takes a job off hold
 * @func hold
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.offHold = function (req, res, next) {

  var id = req.params.id,
      followUpComplete = req.body.FollowUpComplete;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (job.Closed || job.Completed) {
        return next(new restify.ConflictError(`This job is in a closed or completed state`));
      } else if (!job.OnHold) {
        return next(new restify.ConflictError(`This job is not in a hold state`));
      }

      var dataJobs = [];

      job.OnHold = null;

      var movementPromise = jobHelper.writeMovement(id, 'status', {
        Who: jobHelper.makeUser(req.user),
        Status: dao.refs.activityStatus.OFF_HOLD
      }, req.body.Reason, req.body.Wrapup);

      // user nominates if the follow up is complete when taking a job off hold
      if (followUpComplete && job.FollowUp) {
        job.FollowUp = null;

        var followUpMovementPromise = jobHelper.writeMovement(id, 'follow-up-complete', {
          Who: jobHelper.makeUser(req.user)
        }, req.body.Reason, req.body.Wrapup);

        dataJobs.push(followUpMovementPromise);
      }

      dataJobs.push(movementPromise);
      dataJobs.push(job.save());

      return Q.all(dataJobs)
        .then((results) => {

          res.send({});
          return next();

        });

    })
    .catch(next)
    .done();

};

/**
 * Reassigns a job
 * @func reassign
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.reassign = function (req, res, next) {

  var id = req.params.id;
  var toUser = req.body.To,
      fromUser = req.body.From;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (job.Closed || job.Completed) {
        return next(new restify.ConflictError(`This job is in a closed or completed state`));
      }

      var dataJobs = [];

      // could be being unassigned
      if (!toUser) {
        job.Assigned = null;
      } else {
        job.Assigned = jobHelper.makeMovement(req.user);

        var movementPromise = jobHelper.makeUserFromEmail(toUser)
          .then((toUserObj) => {

            return jobHelper.writeMovement(id, 'user-assignment', {
              Who: jobHelper.makeUser(req.user),
              To: toUserObj,
              Priority: req.body.Priority
            }, req.body.Reason, req.body.Wrapup);

          });

        dataJobs.push(movementPromise);
      }

      if (req.body.Priority) {
        job.Priority = req.body.Priority;
      }

      if (!job.FollowUp || job.FollowUp.When < (new Date())) {
        job.FollowUp = jobHelper.makeMovement(req.user);
      }

      // job.OnHold = null;
      // job.Reserved = null;
      // job.Completed = null;

      dataJobs.push(job.save());

      return Q.all(dataJobs)
        .then((results) => {

        res.send({});
        return next();

      });

    })
    .catch(next)
    .done();

};

/**
 * Closes a job
 * @func close
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.close = function (req, res, next) {

  var id = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (job.Closed || job.Completed) {
        return next(new restify.ConflictError(`This job is already in a closed or completed state`));
      }

      job.Assigned = null;
      job.FollowUp = null;
      job.OnHold = null;
      job.Reserved = null;
      job.Completed = null;

      job.Closed = jobHelper.makeMovement(req.user);

      var movementPromise = jobHelper.writeMovement(id, 'status', {
        Who: jobHelper.makeUser(req.user),
        Status: dao.refs.activityStatus.CLOSED
      }, req.body.Reason, req.body.Wrapup);

      var jobUpdatePromise = job.save();

      return Q.spread([movementPromise, jobUpdatePromise], (mres, jres) => {

        res.send({});
        return next();

      });

    })
    .catch(next)
    .done();

};

/**
 * Completes a job
 * @func complete
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.complete = function (req, res, next) {

  var id = req.params.id,
      followUp = req.body.FollowUp;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (job.Closed || job.Completed) {
        return next(new restify.ConflictError(`This job is already in a closed or completed state`));
      }

      // this array will manage all of the data jobs currently outstanding
      var dataJobs = [];

      /* check if we need to follow up */
      if (followUp) {

        // set the date, and add a movement
        job.FollowUp = jobHelper.makeMovement(req.user, followUp);

        var followUpMovementPromise = jobHelper.writeMovement(id, 'follow-up', {
          Who: jobHelper.makeUser(req.user),
          FollowUpDue: followUp
        }, `Job has been completed with a future follow up date: ${req.body.Reason}`, req.body.Wrapup);

        dataJobs.push(followUpMovementPromise);

      } else {

        job.FollowUp = null;

      }

      job.Assigned = null;
      job.OnHold = null;
      job.Reserved = null;

      job.Completed = jobHelper.makeMovement(req.user);
      job.Closed = jobHelper.makeMovement(req.user);

      var movementPromise = jobHelper.writeMovement(id, 'status', {
        Who: jobHelper.makeUser(req.user),
        Status: dao.refs.activityStatus.COMPLETED
      }, req.body.Reason, req.body.Wrapup);

      var jobUpdatePromise = job.save();

      dataJobs.push(movementPromise);
      dataJobs.push(jobUpdatePromise);

      return Q.all(dataJobs)
        .then((results) => {

        res.send({});
        return next();

      });

    })
    .catch(next)
    .done();

};

/**
 * Resurrects a job
 * @func complete
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.resurrect = function (req, res, next) {

  var id = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (!job.Closed && !job.Completed) {
        return next(new restify.ConflictError(`This job is not in a closed or completed state`));
      }

      var dataJobs = [];

      job.Closed = null;
      job.Completed = null;

      var jobUpdatePromise = job.save();

      dataJobs.push(jobUpdatePromise);

      return Q.all(dataJobs)
        .then((results) => {

        res.send({});
        return next();

      });

    })
    .catch(next)
    .done();

};

/**
 * Puts all other assignments on hold
 * @func holdOther
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.holdOthers = function (req, res, next) {

  var id = req.query.id;

  // validate the id is the correct format
  if (id && !ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  var jobQuery = null,
      reason = '';

  if (id) {

    /* not closed, not on hold, assigned to me and not the id
       passed into this api */
    jobQuery = {
      Closed: null,
      OnHold: null,
      Assigned: {
        Who: { EmailAddress: req.user.email }
      },
      _id: { $neq: id }
    };

    reason = `Assignment ${id} has forced this job on hold`;

  } else {

    /* not closed, not on hold, assigned to me and not the id
       passed into this api */
    jobQuery = {
      Closed: null,
      OnHold: null,
      Assigned: {
        Who: { EmailAddress: req.user.email }
      }
    };

  }

  return ActivityBase
    .find(jobQuery)
    .sort({ "Created.When": -1 })
    .exec()
    .then(function (jobs) {

      // trax client, for further requests
      var client = new TraxClient({ token: req.headers.authorization });

      return jobHelper.makeWrapupFromName('Interrupt')
        .then(function (wu) {

          var holdRequest = {
            FollowUp: new Date(0),  /* Thu Jan 01 1970 00:00:00 GMT+0000 (UTC) */
            Reason: reason,
            Wrapup: wu
          };

          // send all of the requests now
          var holdRequests = _.map(jobs, j => client.putJobOnHold(j._id, holdRequest));

          return Q.all(holdRequest)
            .then(function (holdResponses) {

              res.send({
                held: _.map(jobs, j => j._id)
              });

              return next();
            });

        });

    })
    .catch(next)
    .done();

};


/**
 * Changes a job's type
 * @func changeType
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.changeType = function (req, res, next) {

  logger.info('Changing job type');
  let job = null;
  let id = req.params.id;
  // validate the id is the correct format
  if (id && !ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }
  return ActivityBase.findById(id)

    .then(function (j) {
      // validate that we actually got a job
      if (!j) {
        return next(new restify.NotFoundError(id));
      }
      // if the job is already closed or completed, we treat this
      // as a bad request
      if (j.Closed || j.Completed) {
        return next(new restify.ConflictError(`This job is in a closed or completed state`));
      }
      job = j;

      return dao.ctrl.JobType.findOne({ where: { iD: req.body.newJobTypeId }})
    })
    .then(function (jobType) {

      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate a job type with id ${req.body.newJobTypeId}`));
      }

      //dao.jobs.factory(jobType.ModelType)._t;
      let updatedCustomerJob = dao.jobs.factory(jobType.ModelType, job);

      let newJobType = {
        Description: jobType.description,
        JobTypeId: jobType.iD,
        TypeCode: jobType.typeCode
      };

      let oldJobType = job.JobType;


      let movementPromise = jobHelper.writeMovement(id, 'job-type-change', {
        Who: jobHelper.makeUser(req.user),
        NewJobType: newJobType,
        OldJobType: oldJobType
      }, req.body.Reason, null);

      updatedCustomerJob.JobType = newJobType;

      let jobSavePromise = job.update(updatedCustomerJob);

      return Q.all([movementPromise, jobSavePromise]);
    })
    .then(function(job){
      res.send({});
      return next();
    })
    .catch(next)
    .done();
};

/**
 * Chains jobs together
 * @func chain
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.chain = function (req, res, next) {

  var ids = req.body.ids;

  if (!ids || ids.length == 0) {
    return next(new restify.InvalidArgumentError(`No jobs were provided to chain`));
  }

  if (_.filter(ids, id => !ObjectId.isValid(id)).length > 0) {
    return next(new restify.InvalidArgumentError(`At least one of the requested job ids was invalid`));
  }

  return ActivityBase.find({ _id: { $in: ids } })
    .then(function (jobs) {

      /* the same user must be assigned to all
         of the jobs being chained */
      var assigneeCount = _(jobs).filter(j => j.Assigned != null)
       .map(j => j.Assigned.Who.EmailAddress)
       .uniq()
       .value()
       .length;

      if (assigneeCount > 1) {
        return next(new restify.ConflictError(`More than one user is assigned a job in the chain`));
      }

      // perform all of the chain updates now
      var chainUpdates = _.map(jobs, (job) => {

        return ActivityBase.update(
          { _id: job.id },
          { $addToSet: { Chain: { $each: ids } } },
          { multi: false }
        );

      });

      /* get the first assigned job in the chain, and grab its assignee */
      var assignee = _(jobs).filter(j => j.Assigned != null)
                            .take(1);

      return Q.all(chainUpdates)
        .then((chainUpdateResults) => {

          // trax client, for further requests
          var client = new TraxClient({ token: req.headers.authorization });

          var reassigns = _.map(jobs, (job) => {

            return client.reassignJob(job._id, {
              To: assignee.EmailAddress,
              Reason: "Assigning to chained job assignee",
              Wrapup: null
            });

          });

          return Q.all(reassigns);

        });

    })
    .catch(next)
    .done();

};

/**
 * Unchains a job
 * @func unchain
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.unchain = function (req, res, next) {

  var id = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      var dataJobs = [];

      // stop the job from pointing out
      job.Chain = [];

      var jobUpdatePromise = job.save();
      var referenceUpdatePromise = ActivityBase.update(
        { "Chain": id },
        { "$pull": { "Chain": id } },
        { multi: true }
      );

      dataJobs.push(jobUpdatePromise);
      dataJobs.push(referenceUpdatePromise);

      return Q.all(dataJobs)
        .then((results) => {

        res.send({});
        return next();

      });

    })
    .catch(next)
    .done();

};

/**
 * Updates the identity set
 * @func idents
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.idents = function (req, res, next) {

  var id = req.params.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  return ActivityBase.findById(id)
    .then(function (job) {

      // validate that we actually got a job
      if (!job) {
        return next(new restify.NotFoundError(id));
      }

      // if the job is already closed or completed, we treat this
      // as a bad request
      if (job.Closed || job.Completed) {
        return next(new restify.ConflictError(`This job is in a closed or completed state`));
      }

      var oldIdentities = job.Identities,
          newIdentities = req.body || {};

      var movementPromise = jobHelper.writeMovement(id, 'job-identities-change', {
        Who: jobHelper.makeUser(req.user),
        OldIdentities: oldIdentities || {},
        NewIdentities: newIdentities
      }, req.body.Reason, req.body.Wrapup);

      job.Identities = newIdentities;
      var jobUpdatePromise = job.save();

      return Q.all([movementPromise, jobUpdatePromise])
        .then((results) => {

        res.send({});
        return next();

      });

    })
    .catch(next)
    .done();

};

/**
 * Attach a file to a job
 * @func attach
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.attachment = function (req, res, next) {

  logger.info('Attaching files');
  let attachments = req.body;
  let id = req.context.id;

  // validate the id is the correct format
  if (!ObjectId.isValid(id)) {
    return next(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
  }

  if (!req.body || req.body.length == 0) {
    logger.info('no attachments supplied in request.');

    res.send(200, []);
    return next();
  }

  let work = [
    filesHelper.uploadAttachments(req.body),
    ActivityBase.findOne({_id:id})
  ];
  var ret = Q.all(work)
    .spread(function(ids, job) {
      if (!job) {
        return next(new restify.InvalidArgumentError(`Unable to locate a job with id ${id}`));
      }
      if (!job.Attachments){
        job.Attachments = [];
      }
      job.Attachments.push.apply(job.Attachments, ids);
      return job.save()
    })
    .then(function(j, numAffected) {
      if (numAffected < 1) {
        return next(new restify.InternalError("update failed"));
      }
      res.send(200);
      return next();
    })
    .catch(next)
    .done();
  return ret;
};

/**
 * remove a file from a job
 * @func attach
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.removeAttachment = function (req, res, next) {
  logger.info('Removing files');
  let attachments = req.body;
  let jobId = req.params.id;
  let attachmentId = req.params.aid;

  if (!ObjectId.isValid(jobId)) {
    return next(new restify.InvalidArgumentError(`The job id "${jobId}" is not a valid ObjectId`));
  }
  if (!ObjectId.isValid(attachmentId)) {
    return next(new restify.InvalidArgumentError(`The job id "${attachmentId}" is not a valid ObjectId`));
  }

  return ActivityBase.findOne({_id:jobId})
    .then(function(job){
      if (!job){
        return next(new restify.ResourceNotFoundError(`Unable to locate a job with id ${jobId}`));
      }
      if (!job.Attachments || job.Attachments.indexOf(attachmentId) < 0) {
        return next(new restify.ResourceNotFoundError(`Unable to locate an attachment with id ${attachmentId} on job with id ${jobId}`));
      }
      var index = job.Attachments.indexOf(attachmentId);
      job.Attachments.splice(index, 1);
      return job.save();
    })
    .then(function(j){
      res.send(200);
      return next();
    })
    .catch(next)
    .done();
}

/**
 * returns a list of file attachment information objects that are assigned to a
 * job.
 * @func attach
 * @param req Object Incoming request
 * @param res Object Outgoing response
 * @param next Function Next function in the middleware chain
 */
JobRoutes.prototype.listAttachments = function (req, res, next) {
  logger.info('retrieving files');

  let jobId = req.params.id;

  if (!ObjectId.isValid(jobId)) {
    return next(new restify.InvalidArgumentError(`The job id "${jobId}" is not a valid ObjectId`));
  }
  // trax client, for further requests
  var client = new TraxClient({ token: req.headers.authorization });
  return client.retrieve(jobId, true)
    .then(function(jobResponse){
      let job = jobResponse ? jobResponse.body : null;
      if (!job){
        return next(new restify.ResourceNotFoundError(`Unable to locate a job with id ${jobId}`));
      }
      if (!job.Attachments) {
        return Q([]);
      }
      console.log(job.Attachments);
      return File.find({_id:{$in: job.Attachments}});
    })
    .then(function(files){
      var mapped = files.map(f => ({
        ContentType:"",
        FileDescription: f.FileDescription,
        FileLength: f.FileSize,
        FileName: f.FileName,
        Id: f._id
      }));
      res.send(200, mapped);
      return next();
    })
    .catch(next)
    .done();
}

JobRoutes.prototype.children = function(req, res, next){
  logger.info('retrieving children');

  let jobId = req.params.id;

  if (!ObjectId.isValid(jobId)) {
    return next(new restify.InvalidArgumentError(`The job id "${jobId}" is not a valid ObjectId`));
  }

  return ActivityBase.find({ParentId: jobId})
    .then(function(jobs){
      res.send(200, jobs);
      next();
    })
    .catch(next)
    .done();
}

function calculateChainDependency (jobId) {
  let dependencies = [];
  dependencies.push(jobId);
  return ActivityBase.findOne({_id:jobId})
    .then(job => {
      let work = [];
      if (job && job.Chain) {
        _(job.Chain)
          .filter(chainedId => !_.includes(dependencies, chainedId))
          .forEach(chainedId => work.push(calculateChainDependency(chainedId)))
          .value();
      }
      return Q.all(work)
    })
    .then(dependencyLists =>
      _(dependencies)
        .concat(dependencyLists)
        .flatten()
        .map(d => d.toString())
        .uniq()
        .value()
    );

}


JobRoutes.prototype.chains = function(req, res, next){
  logger.info('retrieving chained jobs');

  let jobId = req.params.id;

  if (!ObjectId.isValid(jobId)) {
    return next(new restify.InvalidArgumentError(`The job id "${jobId}" is not a valid ObjectId`));
  }

  return calculateChainDependency(jobId)
    .then(deps => {
      let others = _.filter(deps, dep => dep != jobId);
      return Q.all(_.map(others, dep => ActivityBase.findOne({_id:dep})));
    })
    .then(function(jobs){
      res.send(200, jobs);
      next();
    })
    .catch(next)
    .done();
}

JobRoutes.prototype.related = function(req, res, next){
  logger.info('retrieving related jobs');
  let jobId = req.params.id;
  if (!ObjectId.isValid(jobId)) {
    return next(new restify.InvalidArgumentError(`The job id "${jobId}" is not a valid ObjectId`));
  }
  let ignoredIdentities = [
    "CrmActivityGuid",
    "CrmAccountGuid",
    "CrmContactGuid",
    "CrmCallerGuid",
    "CrmCampaignGuid"
  ];
  var client = new TraxClient({ token: req.headers.authorization });
  let queryClauses = []
  return client.retrieve(jobId, true)
    .then(function(res){
      let job = res.body

      for (var identityName in job.Identities) {
        if (!_.includes(ignoredIdentities, identityName) && job.Identities[identityName]) {
          job.Identities[identityName].forEach(i => {
            let clause = {};
            clause["Identities." + identityName] = i;
            queryClauses.push(clause)
          });
        }
      }
      if (job.ParentId) {
        queryClauses.push({_id:job.ParentId});
      }
      if (queryClauses.length > 0) {
        return queryHelper.queryJobStores(store => {
          return store.find({$or:queryClauses})
        })
      } else {
        return Q([]);
      }
    })
    .then(jobs => {
      let relatedJobsButNotThisOne = _.filter(jobs, job => job._id != jobId);
      res.send(200, relatedJobsButNotThisOne);
      next();
    })
    .catch(next)
    .done();
}

module.exports = new JobRoutes();
