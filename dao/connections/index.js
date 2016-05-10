"use strict"


var config    = require('config'),
    fm        = require('fm-api-common'),
    logger    = fm.logger,
    mongoose  = require('mongoose'),
    grid      = require('gridfs-stream');

var jobsConfig = config.get('trax-jobs-db');
var jobsArchiveConfig = config.get('trax-jobs-archive-db');
var utilConfig = config.get('trax-util-db');
var documentsConfig = config.get('trax-documents-db');

var mongooseConfig = config.get('mongoose');

var cstr = `mongodb://${jobsConfig.host}:${jobsConfig.port}/${jobsConfig.db}`;
var archiveCstr = `mongodb://${jobsArchiveConfig.host}:${jobsArchiveConfig.port}/${jobsArchiveConfig.db}`;
var utilCstr = `mongodb://${utilConfig.host}:${utilConfig.port}/${utilConfig.db}`;
var documentsCstr = `mongodb://${documentsConfig.host}:${documentsConfig.port}/${documentsConfig.db}`;

logger.trace(`Attempting mongo connection to ${cstr}`);
mongoose.connect(cstr);
var conn = mongoose.connection;

logger.trace(`Attempting mongo connection to ${archiveCstr}`);
var archiveConn = mongoose.createConnection(archiveCstr);

logger.trace(`Attempting mongo connection to ${utilCstr}`);
var utilConn = mongoose.createConnection(utilCstr);

logger.trace(`Attempting mongo connection to ${documentsCstr}`);
var documentsConn = mongoose.createConnection(documentsCstr);

var initConn = function(connection, connStr) {

  /* this control variable tells this module if the data connection has been closed by
     choice (meaning, it's closed because it received an interrupt from the operating
     system). When this isn't the case, the dao module is going to try and re-connect */
  var closedByChoice = false;

  connection.on('connected', function () {
    logger.info(`Mongo has connected`);
  });

  connection.on('error', function (err) {
    logger.fatal(`Mongo is under error`);
    logger.error(err);
  });

  connection.on('disconnected', function () {

    if (!closedByChoice) {

      setTimeout(function () {
        logger.info('Mongo has disconnected, attempting reconnect . . .');
        connection.open(connStr);
      }, 1000);

    } else {

      logger.info('Mongo has disconnected under expected conditions');

    }

  });

  process.on('SIGINT', function() {

    closedByChoice = true;

    connection.close(function () {
      logger.info('Mongoose connection disconnected through app termination');
      process.exit(0);
    });

  });
}

initConn(conn, cstr);
initConn(archiveConn, archiveCstr);
initConn(utilConn, utilCstr);
initConn(documentsConn, documentsCstr);

let documentsGridFs = null;
documentsConn.once('open', function(){
  documentsGridFs = grid(documentsConn.db, mongoose.mongo);
  module.exports.documentsGridFs = documentsGridFs;
})


module.exports.archive= archiveConn;
module.exports.util = utilConn;
module.exports.documents = documentsConn;
