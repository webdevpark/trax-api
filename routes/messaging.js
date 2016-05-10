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
    Message = dao.messaging.models.Message;


/**
 * Type data class module
 * @class JobRoutes
 */
var MessagingRoutes = function () { };

/**
 * sends a message from a user to another user
 * @func sendMessage
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
MessagingRoutes.prototype.sendMessage = function (req, res, next) {

  jobHelper.makeUserFromEmail(req.body.To)
    .then(function(recipient){
      let newMessage = new Message({
        Body: req.body.Body,
        Expiry: formatHelper.toTimeSpanString(req.body.DurationMillis),
        JobId: req.body.JobId,
        Persistent: Boolean(req.body.Persistent),
        Recipient: recipient,
        Sent: {
          User: jobHelper.makeUser(req.user),
          When: Date.now()
        },
        Subject: req.body.Subject,
        TypeOfMessage: req.body.MessageType
      });
      return newMessage.save();
    })
    .then(function(savedMessage){
      res.send(201, {id: savedMessage._id});
      return next();
    })
    .catch(next)
    .done();
}

MessagingRoutes.prototype.deliver = function(req, res, next){
  return Message.findOne({_id: req.params.id})
    .then(function(message){
      if (!message) {
        return next(new restify.ResourceNotFoundError("Could not find message with id " + req.params.id));
      }
      if (message.Delivered) {
        return Q(null);
      }
      var currentUser = jobHelper.makeUser(req.user);
      if (currentUser.EmailAddress != message.Recipient.EmailAddress) {
        return next(new restify.InternalError(`${currentUser.EmailAddress} is unable to mark message ${req.params.id} as delivered as the message was originally sent to ${message.Recipient.EmailAddress}`));
      }
      message.Delivered = {
        User: currentUser,
        When: Date.now()
      };
      return message.save();
    })
    .then(function(){
      res.send(200)
    })
    .catch(next)
    .done();
}

MessagingRoutes.prototype.acknowledge = function(req, res, next){
  return Message.findOne({_id: req.params.id})
    .then(function(message){
      if (!message) {
        return next(new restify.ResourceNotFoundError("Could not find message with id " + req.params.id));
      }
      if (message.Acknowledged) {
        return Q(null);
      }
      var currentUser = jobHelper.makeUser(req.user);
      if (currentUser.EmailAddress != message.Recipient.EmailAddress) {
        return next(new restify.InternalError(`${currentUser.EmailAddress} is unable to mark message ${req.params.id} as acknowledged as the message was originally sent to ${message.Recipient.EmailAddress}`));
      }
      message.Acknowledged = {
        User: currentUser,
        When: Date.now()
      };
      return message.save();
    })
    .then(function(){
      res.send(200)
    })
    .catch(next)
    .done();
}

MessagingRoutes.prototype.retract = function(req, res, next){
  return Message.findOne({_id: req.params.id})
    .then(function(message){
      if (!message) {
        return next(new restify.ResourceNotFoundError("Could not find message with id " + req.params.id));
      }
      if (message.Retracted) {
        return Q(null);
      }

      var currentUser = jobHelper.makeUser(req.user);

      message.Retracted = {
        User: currentUser,
        When: Date.now()
      };
      return message.save();
    })
    .then(function(){
      res.send(200)
    })
    .catch(next)
    .done();
}

MessagingRoutes.prototype.retrieveActive = function(req, res, next){
  return Message.find({Retracted: null, Delivered: null, Acknowledged: null})
    .then(function(messages){
      if(!messages) {
        return next(new restify.InternalError("no response from mongo query"));
      }
      res.send(200, messages)
    })
    .catch(next)
    .done();
}

MessagingRoutes.prototype.retrieveMy = function(req, res, next){
  var currentUser = jobHelper.makeUser(req.user);

  return Message.find({Retracted: null, Delivered: null, Acknowledged: null, "Recipient.EmailAddress": currentUser.EmailAddress})
    .then(function(messages){
      if(!messages) {
        return next(new restify.InternalError("no response from mongo query"));
      }
      res.send(200, messages)
    })
    .catch(next)
    .done();
}

MessagingRoutes.prototype.retrieve = function(req, res, next){
  return Message.findOne({ _id: req.params.id})
    .then(function(message){
      if (!message) {
        return next(new restify.ResourceNotFoundError(`Could not find message with id ${req.params.id}`));
      }
      res.send(200, message);
      next();
    })
    .catch(next)
    .done();
}

module.exports = new MessagingRoutes();
