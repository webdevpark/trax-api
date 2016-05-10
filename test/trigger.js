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
    nock      = require('nock');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api,
    Comment = dao.comments.models.Comment;

hippie.assert.showDiff = true;


//job 1 for testing format poppable s
var jobId1 = null;

/* following 3 jobs have job types that have triggers set on user defined 1 trigger point
*  jobs with sql trigger run sql that inserts the job's _id into the TriggerQueryTest table
*  jobs with web trigger will be mocked to determine success
*/
var jobIdSqlTriggers = null;
var jobIdWebTriggers = null;
var jobIdSqlAndWebTriggers = null;

describe("trigger service", function(){

  beforeEach(function(done){
    var cj = new CustomerJob({JobType:{JobTypeId:1128},Identities:{TontoApplicationId:["1"]}});
    var cj2 = new CustomerJob({JobType:{JobTypeId:2}});
    var cj3 = new CustomerJob({JobType:{JobTypeId:3}});
    var cj4 = new CustomerJob({JobType:{JobTypeId:4}});
    Q.all([cj.save(), cj2.save(), cj3.save(), cj4.save()])
      .spread(function(job1, job2, job3, job4){
        jobId1 = job1._id;
        jobIdSqlTriggers = job2._id;
        jobIdWebTriggers = job3._id;
        jobIdSqlAndWebTriggers = job4._id;
        done();
      })
    .catch(function(e){console.log(e);})
  })

  describe("GET /trigger/format/:trigger/:id", function(){
    it("should format a poppable url", function(done){
          api(function(apiServer){
            return apiServer
              .get(`/trigger/format/Before%20Edit/${jobId1}`)
              .expectStatus(200)
              .expect(function(res, body, next){
                var assertions = [
                  hippie.assert(body.length, 3, "num results"),
                  hippie.assert(body[0].Uri, 'https://test-web.firstmac.com.au/justice/Search?q=1', 'uri'),
                  hippie.assert(body[0].Name, 'J4', "screen name")
                ];
                var invalid = false
                assertions.forEach(function(item){
                  if (item){
                    invalid = true;
                    next(item);
                  }
                });
                if (!invalid){
                  next();
                }
              })
          }, done);
        });
  });

  describe("POST /trigger/:trigger/:id", function(){
    it("should execute a sql trigger for a job type trigger point with a sql trigger task", function(done){
      api(function(apiServer){
        return apiServer
          .post(`/trigger/User%20Defined%201/${jobIdSqlTriggers}`)
          .expectStatus(200)
          .expect(function(res, body, next){
            dao.ctrl.sequelize.query(`select * from "TriggerQueryTest" where "Text" = '${jobIdSqlTriggers}'`, { type: Sequelize.QueryTypes.SELECT})
              .then(function(rows){
                var assertions = [
                  hippie.assert(rows.length, 1, 'sql insert'),
                  hippie.assert(rows[0].Text, String(jobIdSqlTriggers), 'ret value')
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
              .catch(e => {console.log(e);next(e);})
          })
      }, done);

    });

    it("should execute a web trigger for a job type trigger point with a web trigger task", function(done){
      //nock will mock a single call to http://localhost/test/3, scope.isDone() determines whether it was hit.
      //the job with id jobIdWebTrigger is set up with a web trigger on user defined 1 that hits that url
      let scope = nock('http://localhost')
        .get('/test/3')
        .reply(200);
      api(function(apiServer){
        return apiServer
          .post(`/trigger/User%20Defined%201/${jobIdWebTriggers}`)
          .expectStatus(200)
          .expect(function(res, body, next){
            next(hippie.assert(scope.isDone(), true, 'web trigger url hit'));
          })
      }, done);

    });

    it("should execute a web trigger and a sql trigger for a job type trigger point with a web trigger task and a sql trigger task", function(done){
      let scope = nock('http://localhost')
        .get('/test/4')
        .reply(200);
      api(function(apiServer){
        return apiServer
          .post(`/trigger/User%20Defined%201/${jobIdSqlAndWebTriggers}`)
          .expectStatus(200)
          .expect(function(res, body, next){
            dao.ctrl.sequelize.query(`select * from "TriggerQueryTest" where "Text" = '${jobIdSqlAndWebTriggers}'`, { type: Sequelize.QueryTypes.SELECT})
              .then(function(rows){
                var assertions = [
                  hippie.assert(rows.length, 1, 'sql insert'),
                  hippie.assert(rows[0].Text, String(jobIdSqlAndWebTriggers), 'ret value'),
                  hippie.assert(scope.isDone(), true, 'web trigger url hit')
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
              .catch(e => {console.log(e);next(e);})
          })
      }, done);

    });
  });
});
