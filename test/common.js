"use strict"

/**
 * Integration tests for the jobs module
 * @module test/job
 */

var hippie    = require('hippie'),
    fm        = require('fm-api-common'),
    server    = require('../server'),
    Q         = require('q'),
    dao       = require('../dao'),
    testData  = require('./data/ctrl'),
    connections = require('../dao/connections');

var ActivityBase = dao.jobs.models.ActivityBase;
var ActivityBaseArchive = dao.jobs.models.archive.ActivityBase;
var CustomerJob = dao.jobs.models.CustomerJob;
var Serial = dao.util.models.Serial;
var File = dao.documents.models.File;
var Event = dao.tracking.models.Event;
var Comment = dao.comments.models.Comment;
var Message = dao.messaging.models.Message;
var RecurringJob = dao.recurring.models.RecurringJob;

function api(work, done, assertion) {

  let setup = hippie(fm.server)
    .json()
    .use(function(options, next) {
      options.strictSSL = false;
      next(options);
     })
    .base('https://[::]:3000');

    work(setup)
      .end(function(err, res, body) {
        if (err) {
          console.log(err);
          done(err);
        }
        else {
          if (typeof(assertion) == "function")
          {
            assertion();
          }

          done();
        }
      });
}

before(function(done) {
  fm.server.listen(3000);
  resetTestingDatabase().then(function(){
    done();
  });
})

function resetTestingDatabase(){
  //only clear if we are using a local linked mongo container.
  var promises = [];
  if (process.env.MONGO_ACTIVITIES_PORT_27017_TCP_ADDR){
    promises.push(Serial.remove());
    promises.push(File.remove());
    promises.push(Event.remove());
    promises.push(Comment.remove());
    promises.push(Message.remove());
    promises.push(RecurringJob.remove());
    if (ActivityBase.db.host == process.env.MONGO_ACTIVITIES_PORT_27017_TCP_ADDR) {
      promises.push(ActivityBase.remove());
    }
    if (ActivityBaseArchive.db.host == process.env.MONGO_ACTIVITIES_PORT_27017_TCP_ADDR) {
      promises.push(ActivityBaseArchive.remove());
    }
  }
  return Q.all(promises);
}

function createJob(options, model) {
  if (model === undefined) {
    model = new CustomerJob();
  }
  model.title = 'Job for unit test fixture';
  model.description = 'This job should be ignored. It only exists for unit testing';
  if (options.jobTypeId !== undefined) {
    model.JobType = {
      JobTypeId: options.jobTypeId,
      Description: "",
      TypeCode:""
    };
  }
  if (options.created) {
    model.Created = {
      When: options.created,
      Who:{
        TontoUserId:null,
        EmailAddress: options.createdBy ? options.createdBy : null,
        Name: null
      }
    };
  }
  if (options.completed !== undefined) {
    model.Completed = {
      When: options.completed,
      Who:{
        TontoUserId:null,
        EmailAddress: options.completedBy === undefined ? null : options.completedBy
      }
    };
  }
  if (options.closed !== undefined) {
    model.Closed = {
      When: options.closed,
      Who:{
        TontoUserId:null,
        EmailAddress: options.closedBy === undefined ? null : options.closedBy
      }
    };
  } else if (options.completed !== undefined ) {
    model.Closed = model.Completed;
  }
  if (options.assignedTo) {
    model.Assigned = {
      When: options.assigned ? options.assigned : Date.now(),
      Who: {
        TontoUserId: null,
        EmailAddress: options.assignedTo
      }
    }
  }
  if (options.followUp) {
    model.FollowUp = {
      When: options.followUp,
      Who:{
        TontoUserId:null,
        EmailAddress: options.followUpBy ? options.followUpBy : null
      }
    };
  }
  if (options.identities !== undefined) {
    model.Identities = options.identities;
  } else {
    if (model.Identities === undefined) {
      model.Identities = {};
    }
    if (options.tontoApplicationId !== undefined) {
      model.Identities.TontoApplicationId = [options.tontoApplicationId];
    }
    if (options.callsLeadId !== undefined) {
      model.Identities.CallsLeadId = [options.callsLeadId];
    }
  }
  return model.save();
}

module.exports.api = api;
module.exports.createJob = createJob;
module.exports.resetTestingDatabase = resetTestingDatabase;
