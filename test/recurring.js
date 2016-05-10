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

var CustomerJobSchema = schemas.CustomerJob,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    ActivityBaseArchive = dao.jobs.models.archive.ActivityBase,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api,
    RecurringJob = dao.recurring.models.RecurringJob;

hippie.assert.showDiff = true;

let recurringJobId1 = null;


describe("/recurring service", function(){

  beforeEach(function(done){
    let jobTemplate = new CustomerJobArchive();
    RecurringJob.remove()
      .then(() => {
        jobTemplate.save()
          .then(job => {
            let recurringJob = new RecurringJob({
              JobTemplateId: job._id
            })
            return recurringJob.save()
              .then(rj => {
                recurringJobId1 = rj._id;
                done();
              });
          })
      })
      .catch(done);
  });

  describe("POST /job/recurring", function(){
    it("should add a recurring job if new", function(done){
      var request = require('./api-mocks/recurring/create-request-1');
      api(function(apiServer){
        return apiServer
          .post(`/recurring`)
          .send(request)
          .expectStatus(201)
          .expect(function(res, body, next){
            ActivityBaseArchive.findOne({_id: body.JobTemplateId})
              .then(function(jobTemplate){
                console.log(body);
                next(hippie.assert(Boolean(jobTemplate), true, 'created JobTemplate'))
              })
              .catch(function(e){console.log(e);next(e);});
          })
      }, done);
    });
  });

  describe("DELETE /job/recurring/:id", function(){
    it('should delete a recurring job', function(done){
      api(function(apiServer){
        return apiServer
          .del(`/recurring/${recurringJobId1}`)
          .expectStatus(204)
      }, done);
    });

  });

  describe("GET /job/recurring", function(){
    it('should retrieve recurring jobs', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/recurring`)
          .expectStatus(200)
          .expect(function(res, body, next){
            console.log(body);
            next(hippie.assert(body.length, 1, 'num results'));
          });
      }, done);
    });
  });

  describe("GET /job/recurring/:id", function(){
    it('should retrieve a recurring job', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/recurring/${recurringJobId1}`)
          .expectStatus(200)
          .expect(function(res, body, next){
            console.log(body);
            next(hippie.assert(Boolean(body), true, 'result'));
          });
      }, done);
    });
  });
});
