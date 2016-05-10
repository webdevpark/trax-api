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
    UserAdapter  = require('../lib/user-adapter').UserAdapter,
    Comment = dao.comments.models.Comment,
    ActivityBase = dao.jobs.models.ActivityBase;


/**
 * comment class module
 * @class JobRoutes
 */
var CommentRoutes = function () { };

/**
 * adds a comment to a job, and to any ancestors of the job. an array of the job ids and their associated comment ids that were added is returned.
 * @func add
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
CommentRoutes.prototype.add = function (req, res, next) {
  var currentUser = jobHelper.makeUser(req.user);

  var commentsAdded = [];
  var recursiveAddComment = function(jobId){
    if (!jobId) {
      return Q();
    }
    let newComment = new Comment({
      Created:
      {
        User: currentUser,
        When: Date.now()
      },
      JobId: req.params.id,
      Text: req.body.Text
    });

    return Q.all([
      newComment.save(),
      ActivityBase.findOne({_id: jobId})
    ])
      .spread(function(savedComment, job){
        commentsAdded.push({commentId: savedComment._id, jobId, jobId})
        return recursiveAddComment(job.ParentId);
      });
  };

  return recursiveAddComment(req.params.id)
    .then(function(){
      res.send(201, commentsAdded);
    })
    .catch(next)
    .done();
}

/**
 * deletes a comment
 * @func delete
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
CommentRoutes.prototype.delete = function(req, res, next){

  var currentUser = jobHelper.makeUser(req.user);

  return Comment.findOneAndUpdate(
    {
      _id:req.params.id,
      Deleted:null
    },
    {
      Deleted: {
        User: currentUser,
        When: Date.now()
      }
    }
  )
    .then(function(comment){
      if (!comment) {
        return next(new restify.ResourceNotFoundError(`could not find comment with id ${req.params.id}`));
      }
      res.send(204);
    })
    .catch(next)
    .done();
}

/**
 * retrieves a list of active comments that have been associated with the specified job id.
 * @func retrieveForJob
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
CommentRoutes.prototype.retrieveForJob = function(req, res, next){
  return Comment.find(
    {
      JobId: req.params.id,
      Deleted: null
    },
    null,
    {sort: "-Created.When"}
  )
    .then(function(list){
      res.send(200, list);
    })
    .catch(next)
    .done();
}

module.exports = new CommentRoutes();
