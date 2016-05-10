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

var fm              = require('fm-api-common'),
    logger          = fm.logger,
    Q               = require('q'),
    _               = require('lodash'),
    mongoose        = require('mongoose'),
    restify         = require('restify'),
    dao             = require('../dao'),
    ObjectId        = mongoose.Types.ObjectId,
    moment          = require('moment'),
    Sequelize       = require('sequelize'),
    url             = require('url'),
    requestPromise  = require('request-promise'),
    xmlToJSON       = require('xml2js');


var jobHelper       = require('../lib/job-helper'),
    queryHelper     = require('../lib/query-helper'),
    filesHelper     = require('../lib/files-helper'),
    formatHelper    = require('../lib/format-helper'),
    TraxClient      = require('../lib/client').TraxClient,
    UserAdapter     = require('../lib/user-adapter').UserAdapter,
    Comment         = dao.comments.models.Comment,
    ActivityBase    = dao.jobs.models.ActivityBase;


/**
 * comment class module
 * @class JobRoutes
 */
var TriggerRoutes = function () { };

/**
 * performs a string replacement on the urls attached to the specified trigger point. replaces {XXX} with XXX property from the specified job.
 * @func formatPoppableUrls
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
TriggerRoutes.prototype.formatPoppableUrls = function (req, res, next) {
  var client = new TraxClient({ token: req.headers.authorization });
  let job = null;
  return client.retrieve(req.params.id, true)
    .then(function(retrieveJobResponse){
      if (!retrieveJobResponse) {
        return next(restify.InvalidArgumentError(`unable to locate job with id ${req.params.id}`));
      }
      job = retrieveJobResponse.body;
      return dao.ctrl.JobType.findOne({ where: { iD: job.JobType.JobTypeId }})
    })
    .then(function (jobType) {
      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate a job type with id ${jobTypeId}`));
      }
      return dao.ctrl.JobTypeTriggerPoint.findAll({
        where: Sequelize.or(
          {jobTypeID: jobType.iD},
          {jobTypeID: null}),
        include:[{
          model: dao.ctrl.TriggerPoint,
          as: "TriggerPoint",
          where: {name: req.params.trigger}
        },
        {
          model: dao.ctrl.TriggerScreenTask,
          as: 'FKTriggerscreentaskJobtypetriggerpoints',
          required: true,
          include: [{
            model: dao.ctrl.TriggerScreen,
            as: "TriggerScreen",
            required: true
          }]
        }]
      });
    })
    .then(function(jobTypeTriggerPoints){
      let formattedUrls = [];
      if (jobTypeTriggerPoints && jobTypeTriggerPoints.length > 0) {
        formattedUrls = jobTypeTriggerPoints.reduce(function(prev, curr, i, src){

          return prev.concat(curr.FKTriggerscreentaskJobtypetriggerpoints.map(tst => ({
            Name: tst.TriggerScreen.name,
            Uri: encodeURI(formatHelper.substituteObjectPropertyValues(decodeURI(tst.TriggerScreen.uri), job))
          })));
        }, []);
      }
      res.send(200, formattedUrls);
    })
    .catch(next)
    .done();
}

/**
 * executes the specified trigger point for the specified job
 * @func execute
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
TriggerRoutes.prototype.execute = function(req, res, next){
  var client = new TraxClient({ token: req.headers.authorization });
  let job = null;
  let jobType = null;
  let triggerPoint = null;

  return client.retrieve(req.params.id, true)
    .then(function(retrieveJobResponse){
      if (!retrieveJobResponse) {
        return next(restify.InvalidArgumentError(`unable to locate job with id ${req.params.id}`));
      }
      job = retrieveJobResponse.body;
      return Q.all([
        dao.ctrl.JobType.findOne({ where: { iD: job.JobType.JobTypeId }}),
        dao.ctrl.TriggerPoint.findOne({ where: { name: req.params.trigger }})
      ]);
    })
    .spread(function (jt, tp) {
      if (!jt) {
        return next(new restify.InvalidArgumentError(`Unable to locate a job type with id ${job.JobType.JobTypeId}`));
      }
      if (!tp) {
        return next(new restify.InvalidArgumentError(`Unable to locate a trigger point with id ${req.params.trigger}`));
      }
      jobType = jt;
      triggerPoint = tp;

      return dao.ctrl.JobTypeTriggerPoint.findAll({
        where: Sequelize.or(
          {jobTypeID: jobType.iD},
          {jobTypeID: null}),
        include:[{
          model: dao.ctrl.TriggerPoint,
          as: "TriggerPoint",
          where: {name: req.params.trigger}
        },
        {
          model: dao.ctrl.TriggerSqlTask,
          as: 'FKTriggersqltaskJobtypetriggerpoints',
          include: [{
            model: dao.ctrl.TriggerQuery,
            as: "TriggerQuery"
          }]
        },
        {
          model: dao.ctrl.TriggerWebTask,
          as: 'FKTriggerwebtaskTriggerwebtasks',
          include: [{
            model: dao.ctrl.TriggerUri,
            as: "TriggerUri"
          }]
        }]
      });
    })
    .then(function(triggersResults){
      let sqlTasks = [];
      let webTasks = [];
      if (triggersResults && triggersResults.length > 0) {
        triggersResults.forEach(result => {
          if (result.FKTriggersqltaskJobtypetriggerpoints && result.FKTriggersqltaskJobtypetriggerpoints.length > 0) {
            sqlTasks = sqlTasks.concat(result.FKTriggersqltaskJobtypetriggerpoints.map(triggerSqlTask => triggerSqlTask.TriggerQuery));
          }
          if (result.FKTriggerwebtaskTriggerwebtasks && result.FKTriggerwebtaskTriggerwebtasks.length > 0) {
            webTasks = webTasks.concat(result.FKTriggerwebtaskTriggerwebtasks.map(triggerWebTask => triggerWebTask.TriggerUri));
          }
        })
      }
      var sequentialSqlTasksPromise = sqlTasks.reduce((prev, curr) => {

        var query = formatHelper.substituteSqlQuery(curr.query, job);
        return prev.then(function(){
          logger.info(`executing sql trigger: ${JSON.stringify(query)}`);
          return dao.ctrl.sequelize.query(query.sql, {replacements: query.parameters})
            .catch(function(err){
              logger.info(`sql trigger execution failed`)
              logger.info(err);
            });
        });
      }, Q([]));

      var sequentialWebTasksPromise = webTasks.reduce((prev, curr) => {

        var triggerUrl = encodeURI(formatHelper.substituteObjectPropertyValues(decodeURI(curr.uri), job))
        return prev.then(function(responses){
          logger.info(`executing web trigger: ${triggerUrl}`)
          return requestPromise(triggerUrl)
            .then(
              //success
              function(resXml){
                //expecting traxtriggers web service to return xml
                logger.info(resXml);
                var jsonResponse = xmlToJSON.parseString(resXml);
                if (jsonResponse.Messages) {
                  jsonResponse.Messages.forEach(message => {
                    if(message.Item1 == 3) {// error
                      logger.info('trax triggers returned error');
                      logger.info(message.Item2)
                    }
                  })
                }
                responses.push(jsonResponse);
                return Q(responses);
              },
              //error
              function(err){
                logger.info(`web trigger execution failed`)
                logger.info(err);
              });
        });
      }, Q([]));

      return Q.all([sequentialSqlTasksPromise, sequentialWebTasksPromise]);
    })
    .then(function(){
      res.send(200);
    })
    .catch(next)
    .done();
}

module.exports = new TriggerRoutes();
