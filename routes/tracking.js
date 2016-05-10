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
    UserAdapter  = require('../lib/user-adapter').UserAdapter;

var Event = dao.tracking.models.Event;

/**
 * Type data class module
 * @class JobRoutes
 */
var TrackingRoutes = function () { };

/**
 * Determines whether the current user is logged in.
 * @func breakTypes
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
TrackingRoutes.prototype.loggedIn = function (req, res, next) {

  var client = new TraxClient({ token: req.headers.authorization });
  return client.latestEvent().then(function(latestEventRes){
    //get event type from activity control database
    let latestEvent = latestEventRes.body;
    if (!latestEvent) {
      return Q(null);
    }
    return dao.ctrl.EventType.findOne({ where: { iD: latestEvent.Type }})
  })
  .then(function(eventType){
    //check if active
    let isLoggedIn = false;
    if (eventType) {
      isLoggedIn = eventType.isActive;
    }
    res.send(200, {loggedIn: isLoggedIn});
    next();
  })
  .catch(next)
  .done();
};

/**
 * Retrieves the latest event for the current user
 * @func breakTypes
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
TrackingRoutes.prototype.latest = function (req, res, next) {
  var user = new UserAdapter(req.user);
  if (!user.getEmail()) {
    return next(new restify.NotAuthorizedError('could not determine current user email address'));
  }
  return Event.find(
    {'Who.EmailAddress': user.getEmail()},
    null,
    {sort: '-When', limit: 1}
  )
  .then(function(e){
    var latestEvent = null;
    if (e && e.length > 0) {
      latestEvent = e[0];
    }
    res.send(200, latestEvent);
  })
  .catch(next)
  .done();
};

/**
 * adds an event for the current user
 * @func breakTypes
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
TrackingRoutes.prototype.add = function (req, res, next) {

  var newEvent = new Event({
    ActivityId: req.body.ActivityId,
    Duration: formatHelper.toTimeSpanString(req.body.Duration),
    Type: req.body.Type,
    When: Date.now(),
    Who: jobHelper.makeUser(req.user),
    Reason: req.body.Reason
  });

  var client = new TraxClient({ token: req.headers.authorization });
  return client.latestEvent().then(function(latestEvent){
    if (!latestEvent
        || latestEvent.ActivityId != newEvent.ActivityId
        || latestEvent.Type != newEvent.Type
        || latestEvent.Duration != newEvent.Duration) {
      return newEvent.save()
    } else {
      return Q(null);
    }
  })
  .then(function(addedEvent){
    let id = "";
    if (addedEvent) {
      id = addedEvent._id;
    }
    res.send(200, {id: id});
  })
  .catch(next)
  .done();
};

module.exports = new TrackingRoutes();
