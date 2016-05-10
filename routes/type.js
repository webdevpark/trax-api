
var fm      = require('fm-api-common'),
    logger  = fm.logger,
    Q       = require('q');

var ctrl    = require('../dao').ctrl;

/** 
 * Type data class module
 * @class JobRoutes
 */
var TypeRoutes = function () { };

/**
 * Retrieves a list of break types
 * @func breakTypes
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
TypeRoutes.prototype.breakTypes = function (req, res, next) { 

  return ctrl.BreakType.findAll({})
    .then(function (bts) {
      res.send(bts);
      return next();
    })
    .catch(next)
    .done();

};

module.exports = new TypeRoutes();