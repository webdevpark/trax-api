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
    server    = require('../server'),
    common    = require('./common'),
    Q         = require('q'),
    moment    = require('moment'),
    mongoose  = require('mongoose'),
    sinon     = require('sinon'),
    jobHelper = require('../lib/job-helper');


var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api;

hippie.assert.showDiff = true;
describe('report routes', function() {

  let jobId = null;
  let jobId2 = null;
  let jobId3 = null;
  let jobId4 = null;

  let closedJobId = null;
  let closedJobId2 = null;

  before(function(done){

    common.resetTestingDatabase()
      .then(function(){
        var cj = common.createJob({tontoApplicationId:"999999", created: moment().add(-1, 'days')});
        var cj2 = common.createJob({tontoApplicationId:"888888", created: moment().add(-2, 'days')});
        var cj3 = common.createJob({tontoApplicationId:"999999", created:moment().add(-5, 'days')}, new CustomerJobArchive());
        var cj4 = common.createJob({tontoApplicationId:"999999", created:moment()});

        var when = moment().add(-1, 'hours').toDate();

        var cj5 = common.createJob({completed:when, completedBy:"test@test.com"});
        var cj6 = common.createJob({completed:when, completedBy:"test2@test.com"});
        return Q.all([cj, cj2, cj3, cj4, cj5, cj6] )
      })
      .spread(function(j1, j2, j3, j4, j5, j6){
        jobId = j1._id;
        jobId2 = j2._id;
        jobId3 = j3._id;
        jobId4 = j4._id;
        closedJobId = j5._id;
        closedJobId2 = j6._id;
        done();
      })
      .catch(function(e){
        done(e);
      });
  });

  describe('GET /report/by-identity/:idt/:id', function(){

    describe('with valid parameters', function(){
      it('should return success', function(done){
        ActivityBase.find().then(function(r){
          api(function(apiServer){
            return apiServer
              .get("/report/by-identity/TontoApplicationId/999999")
              .expectStatus(200)
          }, done);
        })

      });
      it('should return 3 results', function(done){
        api(function(apiServer){
          return apiServer
            .get("/report/by-identity/TontoApplicationId/999999")
            .expect(function(res, body, next){
              next(hippie.assert(body.length, 3, "number of results"));
            })
        }, done);
      });
      it('should return sorted results', function(done) {
        api(function(apiServer){
          return apiServer
            .get("/report/by-identity/TontoApplicationId/999999")
            .expect(function(res, body, next){

              var correctOrder = body[0].Created.When > body[1].Created.When && body[1].Created.When > body[2].Created.When;
              next(hippie.assert(correctOrder, true, "results order"));
            })
        }, done);
      });
    });
  });

  describe('GET /report/job-exists-for-id/:idt/:id', function(){
    describe('when valid idt and id are passed', function(){
      it('should return success');
      it('should return true when an open job exists for the identity');
      describe('when jt and c are omitted', function(){
        it('should return false when only a closed job exists for the identity');
        it('should return false when only a completed job exists for the identity');
      });
      describe('when jt is specified', function() {
        it ('should return false when only a job with a different job type exists for the identity');
        it('should return true when a job with the specified job type exists for the identity');
      });
      describe('when c is true', function(){
        it ('should return true when only closed jobs exist for the identity');
        it ('should return true when only completed jobs exist for the identity');
      });
    });
    it('should fail when :idt is not a valid identity type');
    it('should fail when :idt is missing');
    it('should fail when :id is missing');
  });

  describe('GET /report/closure-count-by-user/:start/:end', function(done){

    var start = null;
    var end = null;

    beforeEach(function(done){
      start = moment().add(-2, 'days');
      end = moment();
      done();
    });

    describe('when valid start and end dates are passed', function(){
      it('should return success', function(done){
        api(function(apiServer){
          return apiServer
            .get(`/report/closure-count-by-user/${start.format()}/${end.format()}`)
            .expectStatus(200)
        }, done);
      });
      it('should return results when closures within period', function(done){
        api(function(apiServer){
          return apiServer
            .get(`/report/closure-count-by-user/${start.format()}/${end.format()}`)
            .expect(function(res, body, next){
              next(hippie.assert(body.length > 0, true, 'length'));
            });
        }, done);
      });
      it('should return correct counts for users when closures exist in the date range');
      it('should return empty array when no closures exist in the date range', function(done){
        api(function(apiServer){
          start = start.add(-100, 'years');
          end = end.add(-100, 'years');
          return apiServer
            .get(`/report/closure-count-by-user/${start.format()}/${end.format()}`)
            .expect(function(res, body, next){
              next(hippie.assert(body.length, 0, 'body'));
            })
        }, done);
      });

    });
    it('should fail with missing start date', function(done){
      api(function(apiServer){
        return apiServer
          .get('/report/closure-count-by-user/')
          .expectStatus(404);
      }, done);
    });
    it('should fail with missing end date', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/report/closure-count-by-user/${start.format()}`)
          .expectStatus(404);
      }, done);
    });
    it('should fail with badly formed start date', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/report/closure-count-by-user/foo/${end.format()}`)
          .expectStatus(409)
      }, done);
    });
    it('should fail with badly formed end date', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/report/closure-count-by-user/${start.format()}/bar`)
          .expectStatus(409)
      }, done);
    });
  });

  describe("GET /report/closures", function(){

    describe("with valid parameters", function(){

      it('should succeed with no parameters', function(done){
        api(function(apiServer){
          return apiServer
            .get('/report/closures')
            .expectStatus(200);
        }, done);
      });

      it('should succeed with only start date', function(done){
        api(function(apiServer){
          return apiServer
            .get(`/report/closures?start=20160101`)
            .expectStatus(200);
        }, done);
      });

      it('should succeed with only end date', function(done){
        api(function(apiServer){
          return apiServer
            .get(`/report/closures?end=20160101`)
            .expectStatus(200);
        }, done);
      });

      it('should succeed with only jt', function(done){
        api(function(apiServer){
          return apiServer
            .get(`/report/closures?jt=1`)
            .expectStatus(200);
        }, done);
      });

      it('should succeed with only tuId', function(done){
        api(function(apiServer){
          return apiServer
            .get(`/report/closures?tuId=1`)
            .expectStatus(200);
        }, done);
      });
    });


    it('should fail with badly formed start date', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/report/closures?start=foo`)
          .expectStatus(409)
      }, done);
    });
    it('should fail with badly formed end date', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/report/closures?end=foo`)
          .expectStatus(409)
      }, done);
    });
    it('should fail with badly formed jt', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/report/closures?jt=foo`)
          .expectStatus(409)
      }, done);
    });
    it('should fail with badly formed tuId', function(done){

      api(function(apiServer){
        return apiServer
          .get(`/report/closures?tuId=foo`)
          .expectStatus(409)
      }, done);
    });
  });

  describe('/report/byUser', function(){
    let sandbox = null;

    before(function(done){
      sandbox = sinon.sandbox.create();
      Q.all([
        common.createJob({assignedTo: "testUser1@test.com"}),
        common.createJob({assignedTo: "testUser1@test.com"}),
        common.createJob({assignedTo: "testUser1@test.com"}),
        common.createJob({assignedTo: "testUser1@test.com"}, new CustomerJob({
          Closed:{
            When: Date.now(),
            Who:{
              TontoUserId:null,
              EmailAddress: "testUser1@test.com"
            }
          }
        })),
        common.createJob({assignedTo: "testUser2@test.com"})
      ]).then(() => {
        done()
      })
      .catch(done);
    })
    after(function(done){
      sandbox.restore();
      done();
    })
    it('should return non-closed jobs assigned to the user', function(done){
      api(function(apiServer){
        sandbox.stub(jobHelper, "makeUser").returns({
          EmailAddress: "testUser1@test.com"
        });
        return apiServer
          .get(`/report/by-user/0/10`)
          .expectStatus(200)
          .expect((res, body, next) => {
            next(hippie.assert(body.length, 3, 'num returned'));
          });
      }, done);
    });
  })
});
