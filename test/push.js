"use strict"

/**
 * Integration tests for the jobs module
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
    jobHelper = require("../lib/job-helper"),
    server    = require('../server'),
    common    = require('./common'),
    Q         = require('q'),
    sinon     = require('sinon'),
    moment    = require('moment'),
    config    = require('config');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api;

hippie.assert.showDiff = true;

describe('/push', function () {
  let sandbox = null;
  beforeEach(function(){
     sandbox = sinon.sandbox.create();
  })

  afterEach(function(){
    sandbox.restore();
  })

  describe('GET /push/unfinished', function(){

    beforeEach(function(){
       //stub config.get('business-hours') to return values below.
       sandbox
        .stub(config, "get")
        .withArgs('business-hours')
        .returns({
          start: "10:30",
          end: "21:30"
        })
    })

      it('should return a job assigned to current user', function(done){
        var job = new CustomerJob({
          Assigned:{
            When: new Date(),
            Who:{
              EmailAddress: "standard.user@firstmac.com.au"
            }
          }
        });
        ActivityBase.remove()
          .then(() => job.save())
          .then(j => {
            api(function(apiServer){
              return apiServer
                .get(`/push/unfinished`)
                .expectStatus(200)
                .expect((res, body, next) => {next(hippie.assert(String(body._id), String(j._id), 'job id'))});
            }, done);
          })
          .catch(done)
      });
      it('should not return a job with a timezone partition outside of business hours', function(done){
        //for this test time is 1am brisbane time (server and job partition timezone)
        sandbox.useFakeTimers(moment('2000-01-01T01:00:00+10:00').toDate().getTime())

        var job = new CustomerJob({
          Assigned:{
            When: new Date(),
            Who:{
              EmailAddress: "standard.user@firstmac.com.au"
            }
          },
          Partitioning: {TimeZone: "E. Australia Standard Time"}
        });
        ActivityBase.remove()
          .then(() => job.save())
          .then(j => {
          api(function(apiServer){
            return apiServer
              .get(`/push/unfinished`)
              .expectStatus(404)
          }, done);
        })
        .catch(done)
      });
      it('should return a job with a timezone partition inside of business hours', function(done){
        //for this test current time is 11am brisbane time (server and job partition timezone)
        sandbox.useFakeTimers(moment('2000-01-01T11:00:00+10:00').toDate().getTime())

        var job = new CustomerJob({
          Assigned:{
            When: new Date(),
            Who:{
              EmailAddress: "standard.user@firstmac.com.au"
            }
          },
          Partitioning: {TimeZone: "E. Australia Standard Time"}
        });
        ActivityBase.remove()
          .then(() => job.save())
          .then(j => {
          api(function(apiServer){
            return apiServer
              .get(`/push/unfinished`)
              .expectStatus(200)
              .expect((res, body, next) => {next(hippie.assert(String(body._id), String(j._id), 'job id'))});
          }, done);
        })
        .catch(done)
      });
      it('should not return a job with a timezone partition inside of current timezone business hours but outside of job timezone partition', function(done){
        //for this test current time is 11am brisbane time (server), 8am perth time (job partition timezone)
        sandbox.useFakeTimers(moment('2000-01-01T11:00:00+10:00').toDate().getTime())

        var job = new CustomerJob({
          Assigned:{
            When: new Date(),
            Who:{
              EmailAddress: "standard.user@firstmac.com.au"
            }
          },
          Partitioning: {TimeZone: "W. Australia Standard Time"}
        });
        ActivityBase.remove()
          .then(() => job.save())
          .then(j => {
          api(function(apiServer){
            return apiServer
              .get(`/push/unfinished`)
              .expectStatus(404)
          }, done);
        })
        .catch(done)
      });
      it('should return a job with a timezone partition outside of current timezone business hours but inside of job timezone partition', function(done){
        //for this test current time is 8 am perth time (server), 11am brisbane time (job partition timezone)
        sandbox.useFakeTimers(moment('2000-01-01T08:00:00+07:00').toDate().getTime())

        var job = new CustomerJob({
          Assigned:{
            When: new Date(),
            Who:{
              EmailAddress: "standard.user@firstmac.com.au"
            }
          },
          Partitioning: {TimeZone: "E. Australia Standard Time"}
        });
        ActivityBase.remove()
          .then(() => job.save())
          .then(j => {
          api(function(apiServer){
            return apiServer
              .get(`/push/unfinished`)
              .expectStatus(200)
              .expect((res, body, next) => {next(hippie.assert(String(body._id), String(j._id), 'job id'))});
          }, done);
        })
        .catch(done)
      });
  });

  describe('GET /push/next', function(){
    let j1Id = null
    let j2Id = null;
    let testAutoUser1 = {
      TontoUserId: 999999,
      EmailAddress: 'testauto1@test.com',
      Name: 'test auto system user 1'
    };
    let testAutoUser2 = {
      TontoUserId: 888888,
      EmailAddress: 'testauto2@test.com',
      Name: 'test auto system user 2'
    };
    let testAutoUser3 = {
      TontoUserId: 777777,
      EmailAddress: 'testauto3@test.com',
      Name: 'test auto system user 3'
    };
    let testAutoUser4 = {
      TontoUserId: 666666,
      EmailAddress: 'testauto4@test.com',
      Name: 'test auto system user 4'
    };
    let testAutoUser5 = {
      TontoUserId: 555555,
      EmailAddress: 'testauto5@test.com',
      Name: 'test auto system user 5'

    }
    let retrieve = null;

    beforeEach(function(done){
      ActivityBase.remove()
        .then(() =>{
          var jobCreates = [
            common.createJob({jobTypeId: 1398}),
            common.createJob({jobTypeId:1398, assignedTo: testAutoUser2.EmailAddress}),
            common.createJob({jobTypeId:2000}, new CustomerJob({Partitioning:{Department:"Test", Office: "An Office"}})),
            common.createJob({jobTypeId: 3000, followUp: moment('20160401').toDate()}),
            common.createJob({jobTypeId: 4000, followUp: moment('20160201').toDate()}),
            common.createJob({jobTypeId: 5000, followUp: moment('20160101').toDate()}),
            common.createJob({jobTypeId: 6000, followUp: moment('20160301').toDate()})
          ]

          return Q.all(jobCreates)
            .spread((j1, j2) => {
              j1Id = j1._id;
              j2Id = j2._id;
              done();
            });
        })
        .catch(err => {console.log(err); done(err);})
    })
    describe ('end to end', function(){
      it('for a single user, single job type, single job, should return that job.', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser1);

        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
            .expect((res, body, next) => {next(hippie.assert(String(body._id), String(j1Id), 'job id'))});
        }, done);
      });
    })

    /*
    *
    * following tests stub the return value of retrieveUserJobTypePriorities, and aren't true end to end tests.
    *
    */
    describe('stubbed retrieveUserJobTypePriorities', function(){
      beforeEach(function(done){
        retrieve = sandbox.stub(routes.push, 'retrieveUserJobTypePriorities');
        done();
      })

      it('should return a job that is assigned to the user if one exists', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser2);
        retrieve.withArgs('testauto2@test.com')
          .returns(Q(
            [{
              JobTypeID: 1398
            }]
          ));
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
             .expectStatus(200)
             .expectBody({_id:`${j2Id}`});
        }, done);
      });

      it('should not return a job with invisible priority', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser3);
        retrieve.withArgs('testauto3@test.com')
        .returns(Q(
          [{
            JobTypeID: 1398,
            Priority: 1000000
          }]
        ));
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(404)
        }, done);
      });
      it('should return a job matching a partition rule', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Equal To",
                Value: "Test"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
        }, done);
      });
      it('should not return a job not matching a partition rule', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Equal To",
                Value: "Another Department"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(404)
        }, done);
      });
      it('should return a job not matching a "Not Equal To" partition rule', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Not Equal To",
                Value: "Another Department"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
        }, done);
      });
      it('should not return a job matching a "Not Equal To" partition rule', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Not Equal To",
                Value: "Test"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(404)
        }, done);
      });
      it('should return a job matching a "Contains" partition rule', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Contains",
                Value: "es"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
        }, done);
      });
      it('should not return a job not matching a "Contains" partition rule', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Contains",
                Value: "abc"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(404)
        }, done);
      });
      it('should "OR" partitions rules for the same attribute', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Contains",
                Value: "Te"
              },
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Contains",
                Value: "atime"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
        }, done);
      })
      it('should "AND" partitions rules for the different attributes', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser4);
        retrieve.withArgs('testauto4@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 2000,
                Attribute: "Department",
                FilterOperatorName: "Equal To",
                Value: "Test"
              },
              {
                JobTypeID: 2000,
                Attribute: "Office",
                FilterOperatorName: "Equal To",
                Value: "Not This Office"
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(404)
        }, done);
      });
      it('should return highest priority job', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser5);
        retrieve.withArgs('testauto5@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 3000,
                Priority: 4
              },
              {
                JobTypeID: 4000,
                Priority: 3
              },
              {
                JobTypeID: 5000,
                Priority: 1
              },
              {
                JobTypeID: 6000,
                Priority: 2
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
            .expect((res, body, next) => {
              ActivityBase.findOne({_id: body._id})
                .then(j => {
                  next(hippie.assert(j.JobType.JobTypeId, 5000, 'job type'));
                })
                .catch(next)
                .done()
            });
        }, done);
      });
      it('for same priority jobs, should return oldest follow up', function(done){
        sandbox.stub(jobHelper, "makeUser").returns(testAutoUser5);
        retrieve.withArgs('testauto5@test.com')
          .returns(Q(
            [
              {
                JobTypeID: 3000
              },
              {
                JobTypeID: 4000
              },
              {
                JobTypeID: 5000
              },
              {
                JobTypeID: 6000
              }
            ]
          ))
        api(function(apiServer){
          return apiServer
            .post(`/push/next`)
            .expectStatus(200)
            .expect((res, body, next) => {
              ActivityBase.findOne({_id: body._id})
                .then(j => {
                  next(hippie.assert(j.JobType.JobTypeId, 5000, 'job type'));
                })
                .catch(next)
                .done()
            });
        }, done);
      });
    })

  });
});
