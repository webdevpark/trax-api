"use strict"

/**
 * Integration tests for the reports module
 * @module test/job
 */

var hippie    = require('hippie'),
    chai      = require('chai'),
    fm        = require('fm-api-common'),
    expect    = chai.expect,
    assert    = chai.assert,
    dao       = require('../dao'),
    routes    = require('../routes'),
    tsys      = require('../lib/trax-sys'),
    jobHelper = require('../lib/job-helper'),
    server    = require('../server'),
    common    = require('./common'),
    Q         = require('q'),
    moment    = require('moment'),
    mongoose  = require('mongoose'),
    schemas   = require('../dao/jobs/schemas');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api,
    Event = dao.tracking.models.Event,
    eventTypes = dao.refs.eventTypes;

hippie.assert.showDiff = true;

describe("/tracking route", function(){
  describe("POST /event", function(){
    it("should add an event", function(done){
      var request = require('./api-mocks/tracking/add-request-1');
      api(function(apiServer){
        return apiServer
          .post('/event')
          .send(request)
          .expectStatus(200)
          .expect(function(res, body, next){
            Event.findOne({_id: body.id})
              .then(function(event){
                var assertions = [
                  hippie.assert(event.Duration, "00:10:00", 'duration'),
                  hippie.assert(event.ActivityId, request.ActivityId, "Activity Id"),
                  hippie.assert(event.Type, request.Type, "event Type"),
                  hippie.assert(event.Reason, request.Reason, "identities"),
                  hippie.assert(Boolean(event.Who), true, "who"),
                  hippie.assert(Boolean(event.When), true, "when")
                ];
                var invalid = false
                assertions.forEach(function(item){
                  if (item){
                    invalid = true;
                    next(item);
                  }
                });
                if (!invalid) {
                  next();
                }
              })
              .catch(function(e){console.log(e);next(e);});
          })
      }, done);
    });
  });

  describe("Event queries", function(){
    let eventId = null
    beforeEach(function(done){
      let stdUser = tsys.auth("std");
      var container = {}
      stdUser(container, null, function(){
        var event = new Event({
          Type:       eventTypes.LUNCH,
          Who:        jobHelper.makeUser(container.user),
          When:       Date.now(),
          Duration:   "00:10:00",
          Reason:     "test"
        });
        event.save().then(function(evt){
          var event2 = new Event({
            Type:       eventTypes.BREAK,
            Who:        jobHelper.makeUser(container.user),
            When:       Date.now(),
            Duration:   "00:10:00",
            Reason:     "test 2"
          });
          return event2.save()
        }).then(function(evt2){
          eventId = String(evt2._id);
          done();
        });
      })
    });

    describe("GET /event/latest", function(){
      it("should return latest added event", function(done){
        api(function(apiServer){
          return apiServer
            .get('/event/latest')
            .expectStatus(200)
            .expect(function(res, body, next){
              next(hippie.assert(body._id, eventId, "id"));
            })
        }, done);
      });
    });

    describe("GET /event/loggedIn", function(){
      it("should return true when logged in", function(done){
        let stdUser = tsys.auth("std");
        var container = {}
        stdUser(container, null, function(){
          var event = new Event({
            Type:       eventTypes.LOGIN,
            Who:        jobHelper.makeUser(container.user),
            When:       Date.now(),
            Duration:   "00:10:00",
            Reason:     "test"
          });
          return event.save().then(function(){
            api(function(apiServer){
              return apiServer
                .get('/event/logged-in')
                .expectStatus(200)
                .expectBody({loggedIn: true});
            }, done);
          });
        })
      });

      it("should return false when not logged in", function(done){
        api(function(apiServer){
          return apiServer
            .get('/event/logged-in')
            .expectStatus(200)
            .expectBody({loggedIn: false});
        }, done);
      });
    });

  });
});
