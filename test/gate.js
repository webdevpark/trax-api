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
    schemas   = require('../dao/jobs/schemas'),
    Sequelize = require('sequelize'),
    sinon     = require('sinon'),
    _         = require('lodash');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    ApprovalJob = dao.jobs.models.ApprovalJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api,
    GateOutcome  = dao.refs.gateOutcome;

hippie.assert.showDiff = true;


let readyStage1Job = null;
let notReadyJob = null;
let suspendedJob = null;

let actionableGateStub = null;
let userFindStub = null;
let sandbox = null;

describe("gate service", function(){
  before(function(){
    sandbox = sinon.sandbox.create();
    actionableGateStub = sandbox.stub(dao.ctrl.JobTypeGate, "find");
    userFindStub = sandbox.stub(dao.ctrl.User, "findOne");
  })

  after(function(){
    sandbox.restore();
  })

  beforeEach(function(done){

    let cj = new ApprovalJob({
      JobType:{JobTypeId:2},
      Partitioning: [],
      Gates:
        [{
          Stage: "gate 1",
          Outcome: GateOutcome.NONE
        },
        {
          Stage: "gate 2",
          Outcome: GateOutcome.NONE
        }]
    });
    let cj2 = new ApprovalJob({
      JobType: {JobTypeId: 2},
      Partitioning:[],
      Gates:[]
    });
    let cj3 = new ApprovalJob({
      JobType:{JobTypeId:2},
      Partitioning: [],
      Gates:
        [{
          Stage: "gate 1",
          Outcome: GateOutcome.SUSPENDED
        },
        {
          Stage: "gate 2",
          Outcome: GateOutcome.NONE
        }]
    });
    Q.all([cj.save(), cj2.save(), cj3.save()])
      .spread(function(job1, job2, job3){
        readyStage1Job = job1;
        notReadyJob = job2;
        suspendedJob = job3;
        //stub out the control database calls:
        //job has 2 gates, gate 1 and gate 2, to be completed in that order.
        actionableGateStub.returns(
          Q([{
            iD:1,
            jobTypeId: readyStage1Job.JobType.JobTypeId,
            roleId: 1,
            precedence: 1,
            gateName: "gate 1"
          },
          {
            iD:2,
            jobTypeId: readyStage1Job.JobType.JobTypeId,
            roleId: 1,
            precedence: 2,
            gateName: "gate 2"
          }]));
        userFindStub.returns(
          Q({
            FKUserdepartmentUsers: [{roleId:1}]
          }));
        done();
      })
    .catch(function(e){console.log(e);})
  })

  describe("PUT /job/:id/approve-gate", function(){
    it("should approve a gate", function(done){
        let request = require('./api-mocks/gate/approve-gate-request-1');
        api(function(apiServer){
          return apiServer
            .put(`/job/${readyStage1Job._id}/approve-gate`)
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findById({_id:readyStage1Job._id})
                .then(function(job){
                    let gate1 = _.filter(job.Gates, gate => gate.Stage == "gate 1")[0];
                    next(hippie.assert(gate1.Outcome, GateOutcome.APPROVED, "gate approval status"))
                })
                .catch(err => {console.log(err); next(err);});
            })
        }, done);
      });
      it('should fail when job gates are not set up', function(done){
        let request = require('./api-mocks/gate/approve-gate-request-1');
        api(function(apiServer){
          return apiServer
            .put(`/job/${notReadyJob._id}/approve-gate`)
            .send(request)
            .expectStatus(409)
        }, done);
      })
      it('should fail when user not authorised', function(done){
        userFindStub.returns(
          Q({
            FKUserdepartmentUsers: []
          }));
        let request = require('./api-mocks/gate/approve-gate-request-1');
        api(function(apiServer){
          return apiServer
            .put(`/job/${readyStage1Job._id}/approve-gate`)
            .send(request)
            .expectStatus(403)
        }, done);
      })
  });

  describe("PUT /job/:id/suspend-gate", function(){
    it("should suspend a gate", function(done){
      let request = require('./api-mocks/gate/suspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${readyStage1Job._id}/suspend-gate`)
          .send(request)
          .expectStatus(200)
          .expect(function(res, body, next){
            ActivityBase.findById({_id:readyStage1Job._id})
              .then(function(job){
                let gate1 = _.filter(job.Gates, gate => gate.Stage == "gate 1")[0];
                next(hippie.assert(gate1.Outcome, GateOutcome.SUSPENDED, "gate status"));
              })
              .catch(err => {console.log(err); next(err);});
          });
      }, done);
    });
    it('should fail when job gates are not set up', function(done){
      let request = require('./api-mocks/gate/suspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${notReadyJob._id}/suspend-gate`)
          .send(request)
          .expectStatus(409)
      }, done);
    })
    it('should fail when user not authorised', function(done){
      userFindStub.returns(
        Q({
          FKUserdepartmentUsers: []
        }));
      let request = require('./api-mocks/gate/suspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${readyStage1Job._id}/suspend-gate`)
          .send(request)
          .expectStatus(403)
      }, done);
    })
  });

  describe("PUT /job/:id/unsuspend-gate", function(){
    it("should unsuspend a gate", function(done){
      let request = require('./api-mocks/gate/unsuspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${suspendedJob._id}/unsuspend-gate`)
          .send(request)
          .expectStatus(200)
          .expect(function(res, body, next){
            ActivityBase.findById({_id:suspendedJob._id})
              .then(function(job){
                let gate1 = _.filter(job.Gates, gate => gate.Stage == "gate 1")[0];
                var assertions = [
                  hippie.assert(gate1.Outcome, GateOutcome.NONE, "gate status"),
                  hippie.assert(Boolean(job.OnHold), true, "job on hold"),
                  hippie.assert(Boolean(job.Assigned), false, "job on hold")
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
              .catch(err => {console.log(err); next(err);});
          });
      }, done);
    });
    it('should fail when current gate not suspended', function(done){
      userFindStub.returns(
        Q({
          FKUserdepartmentUsers: []
        }));
      let request = require('./api-mocks/gate/unsuspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${readyStage1Job._id}/unsuspend-gate`)
          .send(request)
          .expectStatus(403)
      }, done);
    })
    it('should fail when job gates are not set up', function(done){
      let request = require('./api-mocks/gate/unsuspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${notReadyJob._id}/unsuspend-gate`)
          .send(request)
          .expectStatus(409)
      }, done);
    })
    it('should fail when user not authorised', function(done){
      userFindStub.returns(
        Q({
          FKUserdepartmentUsers: []
        }));
      let request = require('./api-mocks/gate/unsuspend-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${suspendedJob._id}/unsuspend-gate`)
          .send(request)
          .expectStatus(403)
      }, done);
    })
  });

  describe("PUT /job/:id/decline-gate", function(){
    it("should decline a gate", function(done){
      let request = require('./api-mocks/gate/decline-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${readyStage1Job._id}/decline-gate`)
          .send(request)
          .expectStatus(200)
          .expect(function(res, body, next){
            ActivityBase.findById({_id:readyStage1Job._id})
              .then(function(job){
                  let gate1 = _.filter(job.Gates, gate => gate.Stage == "gate 1")[0];

                  var assertions = [
                    hippie.assert(gate1.Outcome, GateOutcome.DECLINED, "gate status"),
                    hippie.assert(Boolean(job.Completed), true, "job completed")
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
              .catch(err => {console.log(err); next(err);});
          })
      }, done);
    });
    it('should fail when job gates are not set up', function(done){
      let request = require('./api-mocks/gate/decline-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${notReadyJob._id}/decline-gate`)
          .send(request)
          .expectStatus(409)
      }, done);
    })
    it('should fail when user not authorised', function(done){
      userFindStub.returns(
        Q({
          FKUserdepartmentUsers: []
        }));
      let request = require('./api-mocks/gate/decline-gate-request-1');
      api(function(apiServer){
        return apiServer
          .put(`/job/${readyStage1Job._id}/decline-gate`)
          .send(request)
          .expectStatus(403)
      }, done);
    })
  });

});
