/**
 * Trax middleware route module
 * @module trax-sys
 */

var Q       = require('q'),
    fm      = require('fm-api-common'),
    logger  = fm.logger,
    routes  = require('../routes'),
    config  = require('config'),
    fs      = require('fs'),
    jwt     = require('restify-jwt');

var triggers = require('./triggers');

// per-request configuration values
var reqConf = config.get('request');

var certLocation = config.get("jwt.secret");
var signingCert = fs.readFileSync(__dirname + `/../${certLocation}`);

/** 
 * Trax system class
 * @class TraxSystem
 */
var TraxSystem = function () { };

/** Standard authentication middleware */
TraxSystem.prototype.auth = [
    jwt({ secret: signingCert }),
    (req, res, next) => {
      req.userAdapter = new fm.user.UserAdapter(req.user);
      return next();
    }
  ];

/** 
 * Internal trigger invocation implementation
 * @func _invokeTriggers
 * @param tense {String} Before/After
 * @param point {String} The trigger point to execute
 */
TraxSystem.prototype._invokeTriggers = function (tense, point) {

  return Q.Promise((resolve, reject, progress) => {
    logger.info('Invoking triggers for ' + tense + ' ' + point);
    return resolve();
  });

};

/**
 * Invoke a trigger set middleware
 * @func invokeTriggers
 * @param tense String The tense of the trigger (pre or post)
 * @param point String The trigger point to execute
 * @param id String The id of the job in context 
 */
TraxSystem.prototype.invokeTriggers = function (tense, point) {

  var self = this;

  // a piece of middleware should read only associated job out for the 
  // route parameters given. by the time this middleware is reached
  // we'll have a data object to work with
  return function (req, res, next) {

    return self._invokeTriggers(tense, point)
      .then(() => next())
      .catch(err => next(err));

  };

};

/**
 * Measures a single hit (stat)
 * @func measureHit
 * @param req Request Incoming request
 * @param res Response Outgoing response
 * @param next Function Next call in the chain
 */
TraxSystem.prototype.measureHit = function (req, res, next) {
  logger.info('Measuring hit for ' + req.method + ' ' + req.url);
  return next();
};

/**
 * Measures the time a hit took (stat)
 * @func measureTime
 * @param duration Int Milliseconds passed
 */
TraxSystem.prototype.measureTime = function (duration) {

  return function (req, res, next) {
    logger.info('Measuring time for ' + req.method + ' ' + req.url + ' at ' + duration + ' ms');
    return next();
  };

};

TraxSystem.prototype.action = function (fn, opts) {

  var self = this;
  var procStart = new Date();

  // here is the middleware stack that this function is going to build
  var stack = new Array();

  // only measure a hit if configured as enabled
  if (reqConf.enableStats) {
    stack.push(
      self.measureHit
    );
  }

  // invoke pre-triggers if a trigger point name was given
  if (opts.triggerPoint && reqConf.enableTriggers) {

    stack.push(
      self.invokeTriggers('pre', opts.triggerPoint)
    );

  }

  // invoke the action now
  stack.push(fn);

  // invoke post-triggers if a trigger point name was given
  if (opts.triggerPoint && reqConf.enableTriggers) {

    stack.push(
      self.invokeTriggers('post', opts.triggerPoint)
    );

  }

  // measure timing if required by config
  if (reqConf.enableStats) {
    var procEnd = new Date();

    stack.push(
      self.measureTime(procEnd - procStart)
    );
  }

  return stack;
};



module.exports = new TraxSystem();