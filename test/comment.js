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
    Comment = dao.comments.models.Comment;

hippie.assert.showDiff = true;


//job2 is parent of job3, job1 unrelated.
var jobId1 = null;
var jobId2 = null;
var jobId3 = null;
var commentId1 = null;



describe("/comment service", function(){

  beforeEach(function(done){
    Comment.remove().then(function(){
      var cj = new CustomerJob();
      var cj2 = new CustomerJob();

      Q.all([cj.save(), cj2.save()])
        .spread(function(job1, job2){
          jobId1 = job1._id;
          jobId2 = job2._id;
          var comment = new Comment({
            JobId: jobId1
          });
          var cj3 = new CustomerJob({ParentId: job2._id})
          return Q.all([cj3.save(), comment.save()]);
        })
        .spread(function(job3, comment){
          jobId3 = job3._id;
          commentId1 = comment._id;
          done();
        })
    })
    .catch(function(e){console.log(e);})
  })

  describe("POST /job/:id/comment", function(){
    it("should add a comment to the job", function(done){
      var request = require('./api-mocks/comment/add-request-1');
      api(function(apiServer){
        return apiServer
          .post(`/job/${jobId1}/comment`)
          .send(request)
          .expectStatus(201)
          .expect(function(res, body, next){
            Comment.findOne({_id: body[0].commentId})
              .then(function(comment){
                var assertions = [
                  hippie.assert(Boolean(comment.Created.User), true, 'created user'),
                  hippie.assert(Boolean(comment.Created.When), true, "created when"),
                  hippie.assert(comment.Text, request.Text, "text"),
                  hippie.assert(Boolean(comment.Deleted), false, "Deleted"),
                  hippie.assert(comment.JobId, jobId1, "jobId")
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

    it("should add a comment to job and ancestors", function(done){
      var request = require('./api-mocks/comment/add-request-1');
      api(function(apiServer){
        return apiServer
          .post(`/job/${jobId3}/comment`)
          .send(request)
          .expectStatus(201)
          .expect(function(res, body, next){
            next(hippie.assert(body.length, 2, 'num comments added'));
          });

      }, done);
    });

    it("should not add a comment to children", function(done){
      var request = require('./api-mocks/comment/add-request-1');
      api(function(apiServer){
        return apiServer
          .post(`/job/${jobId2}/comment`)
          .send(request)
          .expectStatus(201)
          .expect(function(res, body, next){
            next(hippie.assert(body.length, 1, 'num comments added'));
          });

      }, done);
    });
  });

  describe("DELETE /job/comment/:id", function(){
    it('should delete a comment', function(done){
      api(function(apiServer){
        return apiServer
          .del(`/job/comment/${commentId1}`)
          .expectStatus(204)
          .expect(function(res, body, next){
            Comment.findOne({_id:commentId1})
              .then(function(comment){
                next(hippie.assert(Boolean(comment.Deleted), true, 'deleted'));
              })
          });

      }, done);
    });
    it('should return not found when non existing id passed', function(done){
      api(function(apiServer){
        return apiServer
          .del(`/job/comment/${jobId1}`)
          .expectStatus(404)
      }, done);
    });
  });

  describe("GET /job/:id/comments", function(){
    it('should retrieve comments for a job', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/job/${jobId1}/comments`)
          .expectStatus(200)
          .expect(function(res, body, next){
            next(hippie.assert(body[0]._id, String(commentId1), 'id'));
          });
      }, done);
    });
  });
});
