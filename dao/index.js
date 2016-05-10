"use strict"

/**
 * Data access objects
 * @module dao
 */


var config    = require('config'),
    Sequelize = require('sequelize'),
    fm        = require('fm-api-common'),
    Q         = require('q'),
    logger    = fm.logger,
    mongoose  = require('mongoose'),
    conn      = require('./connections'),
    tracking  = require('./tracking'),
    messaging = require('./messaging');

var ctrlDb = config.get('trax-ctrl-db');
var mongooseConfig = config.get('mongoose');

mongoose.set('debug', mongooseConfig.debug);

var sequelize = new Sequelize(
  ctrlDb.db, ctrlDb.username, ctrlDb.password, {
    dialect: 'postgres',
    logging: function (query) {
      logger.info(query);
    },
    host: ctrlDb.host,
    port: ctrlDb.port
  }
);


mongoose.Promise = Q.Promise;

module.exports = {
  ctrl: require('./ctrl').init(sequelize),
  jobs: require('./jobs'),
  util: require('./util'),
  documents: require('./documents'),
  tracking: tracking,
  messaging: messaging,
  comments: require('./comments'),
  recurring: require('./recurring'),
  refs: {

    activityStatus: {
      NONE:        0,
      NOT_STARTED: 1,
      OPEN:        2,
      ON_HOLD:     3,
      COMPLETED:   4,
      FOLLOW_UP:   5,
      PROCESSED:   6,
      RESERVED:    7,
      OFF_HOLD:    8,
      CLOSED:      9
    },

    gateOutcome: {
      NONE:         0,
      APPROVED:     1,
      DECLINED:     2,
      SUSPENDED:    3
    },

    eventTypes: tracking.constants.EventTypes,
    messageTypes: messaging.constants.MessageTypes

  }

};
