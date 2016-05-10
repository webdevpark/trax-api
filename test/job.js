"use strict"

/**
 * Integration tests for the jobs module
 * @module test/job
 */

var hippie      = require('hippie'),
    chai        = require('chai'),
    fm          = require('fm-api-common'),
    expect      = chai.expect,
    assert      = chai.assert,
    dao         = require('../dao'),
    routes      = require('../routes'),
    tsys        = require('../lib/trax-sys'),
    server      = require('../server'),
    common      = require('./common'),
    Q           = require('q'),
    filesHelper = require('../lib/files-helper'),
    _           = require('lodash');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    File         = dao.documents.models.File,
    api          = common.api;

hippie.assert.showDiff = true;

describe('/job', function () {

  var goodId = null;
  var closedJobId = null;
  var goodJobTypeID = 387;
  var archiveJobId = null;
  var doc1Id = null;
  beforeEach(function (done) {

    var cj = new CustomerJob({
      Title: 'Job for unit test fixture',
      Description: 'This job should be ignored. It only exists for unit testing',
      JobType:
      {
        JobTypeId:388,
        Description:"Advance / Arrears position adjustment",
        TypeCode:"Operations"
      }
    });

    var cj2 = new CustomerJob({
      Title: 'Job for unit test fixture',
      Description: 'This job should be ignored. It only exists for unit testing',
      Closed: {
        When: Date.now(),
        Who: {
          TontoUserId:0,
          EmailAddress:"testUser@test.com",
          Name: "Test User"
        }
      },
      Completed: {
        When: Date.now(),
        Who: {
          TontoUserId:0,
          EmailAddress:"testUser@test.com",
          Name: "Test User"
        }
      }
    });
    var cj3 = new CustomerJobArchive({
      Title: 'Job for unit test fixture',
      Description: 'This job should be ignored. It only exists for unit testing',
      JobType:
      {
        JobTypeId:388,
        Description:"Advance / Arrears position adjustment",
        TypeCode:"Operations"
      }
    });
    var doc1 = filesHelper.uploadAttachment({filename:"test floating file.pdf", bytes:[1]})
    return Q.all([cj.save(), cj2.save(), cj3.save(), doc1])
      .spread(function (cj, cj2, cj3, d1Id) {
        goodId = cj._id;
        closedJobId = cj2._id;
        archiveJobId = cj3._id;
        doc1Id = d1Id;
        done();
      })
      .catch(function(e){
        done(e);
      });
  });



  describe('GET /:id', function () {



    it('should fail with badly formed id', function(done) {
      api(function(apiServer){
        return apiServer
          .get('/job/notAValidId')
          .expectStatus(409);
      }, done);
    });

    it('should fail with no id', function(done) {
      api(function(apiServer){
        return apiServer
          .get('/job/')
          .expectStatus(409);
      }, done);
    });

    it('should succeed with existing valid id', function(done) {
      api(function(apiServer){
        return apiServer
          .get(`/job/${goodId}`)
          .expectStatus(200);
      }, done);
    });

    it('should fail with non-existing valid id', function(done) {
      api(function(apiServer){
        return apiServer
          .get('/job/000000000000000000000000')
          .expectStatus(404);
      }, done);
    });
    it('should retrieve a job from archive when archive search enabled', function(done) {
      api(function(apiServer){
        return apiServer
          .get(`/job/${archiveJobId}?archive=true`)
          .expectStatus(200);
      }, done);
    });
    it('should not retrieve a job from archive when archive search disabled', function(done) {
      api(function(apiServer){
        return apiServer
          .get(`/job/${archiveJobId}?archive=false`)
          .expectStatus(404);
      }, done);
    });
  });

  describe('POST /', function () {

    it('should send bad request when not given a body', function (done) {

      api((srv) => {
        return srv
          .post('/job')
          .expectStatus(409);
      }, done);

    });

    it('should send bad request when the job type id isn\'t found', function (done) {

      api((srv) => {
        return srv
          .send({
            JobTypeId: -123
          })
          .post('/job')
          .expectStatus(409);

      }, done);

    });

    it('should send created with ObjectId when successful', function (done) {

      api((srv) => {

        return srv
          .send({
            JobTypeId: goodJobTypeID
          })
          .post('/job')
          .expectStatus(201);

      }, done);

    });

  });

  describe('PUT /:id', function () {
    it('should send bad request when not given a valid id');
    it('should send bad request when no job object is specified');
    it('should not update system level fields');
    it('should update base attributes');
    it('should update specialised job attributes');
  });

  describe('PUT /:id/close', function () {
    it('should send bad request when not given a valid id');
    it('should send not found when an id that doesn\'t exist is requested');
    it('should send bad request when no body is specified');
    it('should send bad request when requesting on a job that is already closed');
    it('should send bad request when requesting on a ajob that is already completed');
    it('should close a valid job');
  });

  describe('PUT /:id/complete', function () {
    it('should send bad request when not given a valid id');
    it('should send not found when an id that doesn\'t exist is requested');
    it('should send bad request when no body is specified');
    it('should send bad request when requesting on a job that is already closed');
    it('should send bad request when requesting on a ajob that is already completed');
    it('should complete a valid job');
  });

  describe('PUT /:id/reassign', function () {
    it('should send bad request when not given a valid id');
    it('should send not found when an id that doesn\'t exist is requested');
    it('should send bad request when no body is specified');
    it('should send bad request when requesting on a job that is already closed');
    it('should send bad request when requesting on a ajob that is already completed');
    it('should send bad request when reassigning to a user that doesn\'t exist');
    it('should send bad request when reassigning on behalf of a user that doesn\'t exist');
    it('should reassign a valid job');
  });

  describe('PUT /:id/hold', function () {
    it('should send bad request when not given a valid id');
    it('should send not found when an id that doesn\'t exist is requested');
    it('should send bad request when no body is specified');
    it('should send bad request when requesting on a job that is already closed');
    it('should send bad request when requesting on a job that is already completed');
    it('should send bad request when requesting on a job that is already on hold');
    it('should send bad request when a past follow up date is specified');
    it('should hold a valid job');
  });

  describe('PUT /:id/off-hold', function () {
    it('should send bad request when not given a valid id');
    it('should send not found when an id that doesn\'t exist is requested');
    it('should send bad request when no body is specified');
    it('should send bad request when requesting on a job that is already closed');
    it('should send bad request when requesting on a job that is already completed');
    it('should send bad request when requesting on a job that is not on hold');
    it('should take a job off hold a valid job');
    it('should remove the follow up from a valid job');
    it('should send bad request when removing follow up from a job that does not have follow up set');
  });

  describe('PUT /:id/resurrect', function () {
    it('should send bad request when not given a valid id');
    it('should send not found when an id that doesn\'t exist is requested');
    it('should send bad request when no body is specified');
    it('should send bad request when requesting on a job that is not closed');
    it('should send bad request when requesting on a job that is not completed');
    it('should send bad request when removing follow up from a job that does not have follow up set');
  });

  describe('PUT /hold-others', function () {
    it('should send bad request when not given a valid id');
    it('should send bad request when no body is specified');
    it('should put all jobs on hold when no id is supplied');
    it('should should hold all jobs except for the id supplied');
  });

  describe('PUT /:id/type', function() {



    it('should send bad request when not given a valid id', function(done){
      api((srv) => {
        return srv
          .send({
            newJobTypeId: goodJobTypeID,
            reason: "unit test"
          })
          .put('/job/notavalidid/type')
          .expectStatus(409);
      }, done);
    });
    it('should send not found when given an id that does not exist', function(done){
      api((srv) => {
        return srv
          .send({
            newJobTypeId: goodJobTypeID,
            reason: "unit test"
          })
          .put('/job/000000000000000000000000/type')
          .expectStatus(404);
      }, done);
    });

    it('should send bad request when no body is specified', function(done){
      api((srv) => {
        return srv
          .put(`/job/${goodId}`)
          .expectStatus(409);
      }, done);
    });

    it('should send conflict error when job is closed or completed', function(done){
      api((srv) => {
          return srv
          .send({
            newJobTypeId: goodJobTypeID,
            reason: "unit test"
          })
          .put(`/job/${closedJobId}/type`)
          .expectStatus(409);
      }, done);
    });

    it('should send invalid argument when new job type is not the id of an existing job type', function(done){
      api((srv) => {
        return srv
          .send({
            newJobTypeId:-1,
            reason: "unit test"
          })
          .put(`/job/${goodId}/type`)
          .expectStatus(409);
      }, done)
    });
    it('should change the job type', function(done){

      api((srv) => {
        return srv
          .send({
            newJobTypeId:goodJobTypeID,
            reason: "unit test"
          })
          .put(`/job/${goodId}/type`)
      }, done, function(){
        return ActivityBase
          .findById(goodId)
          .then(function(job){
            expect(job.JobType.JobTypeId).to.equal(goodJobTypeID);
          })
          .catch(function(e){
            done(e);
          })
      });
     });
    it('should write a job type change movement');
    it('should return success', function(done){
      api((srv) => {
        return srv
        .send({
          newJobTypeId:goodJobTypeID,
          reason: "unit test"
        })
        .put(`/job/${goodId}/type`)
        .expectStatus(200)
      }, done)
    });

    describe('when changing model type,', function(){

      let morePropertiesJobId = null

      describe('and changing from a model with more properties,', function(){

        beforeEach(function(done){

          let cj = dao.jobs.factory('future-action-job', {
            JobType:{
              JobTypeId:891,
              Description:'Check Title Registered',
              TypeCode:'Settlements'
            },
            FutureActionJob:Date.now()
          });

          cj.save().then(function(job){
            morePropertiesJobId = job._id
            done();
          })
          .catch(function(e){
            done(e);
          });
        });

        it('should return success', function(done){
          api((srv) => {
            return srv
            .send({
              newJobTypeId:goodJobTypeID,
              reason:"unit test"
            })
            .put(`/job/${morePropertiesJobId}/type`)
            .expectStatus(200);
          }, done);
        });
        it('the job should contain extra properties before update', function(){

          return ActivityBase
            .findById(morePropertiesJobId)
            .then(function(job){
              return expect(job).to.have.property("FutureActionDate");
            })
        });
        it('the job should not contain extra properties after update', function(done){
          api((srv) => {
            return srv
            .send({
              newJobTypeId:goodJobTypeID,
              reason:"unit test"
            })
            .put(`/job/${morePropertiesJobId}/type`)
          }, done, function(){
            return ActivityBase
              .findById(morePropertiesJobId)
              .then(function(job){
                expect(job).to.not.have.property("FutureActionDate");
              })
              .catch(function(e){
                done(e);
              })
          });
        });
      });


    });
  });

  describe("PUT :id/attachment", function(){
    it('should add a file to mongo', function(done){
      var request = require('./api-mocks/job/attachment-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${goodId}/attachment`)
          .send(request)
          .expectStatus(200)
          .expect(function(res, body, next){
            ActivityBase.findOne({_id: goodId})
              .then(function(job){
                next(hippie.assert(job.Attachments.length, 1, 'attachments count'));
              })
              .catch(function(e){console.log(e);next(e);});
          })
      }, done);
    });
    it('should add the file id to the job');
    //{
      //
      // var request = require('./api-mocks/job/attachment-request-1');
      // api(function(apiServer){
      //   return apiServer
      //     .put(`/job/${goodId}/attachment`)
      //     .send(request)
      //     .expectStatus(200)
      //     .expect(function(res, body, next){
      //       ActivityBase.findOne({_id: goodId})
      //         .then(function(job){
      //           next(hippie.assert(job.Attachments[0], doc1Id, 'attachment id'));
      //         })
      //         .catch(function(e){console.log(e);next(e);});
      //     })
      // }, done);
    //});
    it('should succeed with no files', function(done){
      var request = require('./api-mocks/job/attachment-request-2');
      api(function(apiServer){
        return apiServer
          .put(`/job/${goodId}/attachment`)
          .send(request)
          .expectStatus(200)
          .expect(function(res, body, next){
            ActivityBase.findOne({_id: goodId})
              .then(function(job){
                next(hippie.assert(job.Attachments, [], 'attachments count'));
              })
              .catch(function(e){console.log(e);next(e);});
          })
      }, done);
    });

  });

  describe("DELETE /job/:id/attachment/:aid", function(){
    beforeEach(function(done){
      ActivityBase.findOne({_id:goodId}).then(function(job){
        job.Attachments.push(doc1Id);
        return job.save();
      }).then(function(job){
        expect(job.Attachments).to.include(doc1Id);
        done();
      });
    })
    it('should remove an attachment from a job', function(done){

      api(function(apiServer){
        return apiServer
          .del(`/job/${goodId}/attachment/${doc1Id}`)
          .expectStatus(200)
          .expect(function(res, body, next){
            ActivityBase.findOne({_id: goodId})
              .then(function(job){
                next(hippie.assert(job.Attachments, [], 'attachments count'));
              })
              .catch(function(e){console.log(e);next(e);});
          })
      }, done);
    });
  })

  describe("GET /job/:id/attachments", function(){
    beforeEach(function(done){
      ActivityBase.findOne({_id:goodId}).then(function(job){
        job.Attachments.push(doc1Id);
        return job.save();
      }).then(function(job){
        expect(job.Attachments).to.include(doc1Id);
        done();
      });
    })
    it('should return a list of attachments', function(done){

      api(function(apiServer){
        return apiServer
          .get(`/job/${goodId}/attachments`)
          .expectStatus(200)
          .expect(function(res, body, next){
            next(hippie.assert(body.length, 1, 'attachments count'));
          })
      }, done);
    });
  });

  describe("GET /job/:id/children", function(){
    let childId = null;
    beforeEach(function(done){
      let child = new CustomerJob({ParentId: goodId});
      child.save().then(job => {
        childId = job._id
        done();
      });

    })
    it('should return children', function(done){
      api(function(apiServer){
        return apiServer
          .get(`/job/${goodId}/children`)
          .expectStatus(200)
          .expect(function(res, body, next){
            var assertions = [
              hippie.assert(body.length, 1, 'children count'),
              hippie.assert(body[0]._id, String(childId), 'child id')
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
      }, done);
    })
  });
  describe("GET /job/:id/chains", function(){
    let sourceChainJobId = null;
    let chainedIds = [];
    beforeEach(function(done){
      /*
      * set up a chain A -> B, A -> C, B -> C, B -> D
      * chains for A should be B, C, D
      */
      chainedIds = [String(closedJobId),String(goodId)];
      let middleChainJob = new CustomerJob({Chain:[closedJobId, goodId]});

      middleChainJob.save().then(job => {
        chainedIds.push(String(job._id));
        let sourceChainJob = new CustomerJob({Chain: [goodId, job._id]});
        return sourceChainJob.save()
      }).then(job => {
        sourceChainJobId = job._id;
        done();
      });
    });
    it("should return chained jobs", function(done){
      api(function(apiServer){
        return apiServer
          .get(`/job/${sourceChainJobId}/chains`)
          .expectStatus(200)
          .expect(function(res, body, next){
            let ids = body.map(j => j._id)
            var assertions = [
              hippie.assert(_.intersection(ids, chainedIds).length, 3, "num correct chained jobs"),
              hippie.assert(ids.length, 3, "num chained jobs")
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
      }, done);
    });
  });
  describe("GET /job/:id/related", function(){
    let sourceJobId = null;
    let relatedIds = [];
    beforeEach(function(done){
      /*
      * set up source and related jobs. CrmActivityGuid not checked as part of
      * related check, so not related.
      */
      var sourceJob = new CustomerJob({
        ParentId: goodId,
        Identities:{
          TontoApplicationId: ["1", "2"],
          CrmActivityGuid: ["1"],
          CallsLeadId: ["1"]
        }});

      var relatedJob1 = new CustomerJob({
        Identities:{
          TontoApplicationId:["1"]
        }
      });
      var relatedJob2 = new CustomerJob({
        Identities:{
          TontoApplicationId:["2"]
        }
      });
      var relatedJob3 = new CustomerJob({
        Identities:{
          CallsLeadId:["1"]
        }
      });
      var notRelatedJob1 = new CustomerJob({
        Identities:{
          CrmActivityGuid:["1"]
        }
      });
      var notRelatedJob2 = new CustomerJob({
        Identities:{
          CallsLeadId:["-1"]
        }
      });
      Q.all([
        sourceJob.save(),
        Q.all([
          relatedJob1.save(),
          relatedJob2.save(),
          relatedJob3.save()
        ]),
        Q.all([
          notRelatedJob1.save(),
          notRelatedJob2.save()
        ])
      ])
        .spread((sourceJob, relatedJobs, unrelatedJobs) =>{
          sourceJobId = String(sourceJob._id);
          relatedIds = relatedJobs.map(function(item){
            return String(item._id);
          });
          relatedIds.push(String(goodId));
          done()
        })
        .catch(console.log);

    });
    it("should return related jobs", function(done){
      api(function(apiServer){
        return apiServer
          .get(`/job/${sourceJobId}/related`)
          .expectStatus(200)
          .expect(function(res, body, next){
            let ids = body.map(j => j._id)
            var assertions = [
              hippie.assert(_.intersection(ids, relatedIds).length, 4, "num correct related jobs"),
              hippie.assert(ids.length, 4, "num related jobs")
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
      }, done);
    });
  });
});
