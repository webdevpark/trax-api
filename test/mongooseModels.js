"use strict"

/**
 * Integration tests for the jobs module
 * @module test/job
 */

var chai      = require('chai'),
    expect    = chai.expect,
    dao       = require('../dao'),
    Q         = require('q');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    JobType      = dao.jobs.common.models.JobType;


describe('when creating a model for an extended schema', function () {

  it('the save should succeeed', function(){

    let cj = new dao.jobs.models.FutureActionJob({
      JobType:{
        JobTypeId:891,
        Description:'Check Title Registered',
        TypeCode:'Settlements'
      },
      FutureActionDate:Date.now()

    });
    return cj.save().then(function(jobId){
      return ActivityBase
        .findById(cj._id)
        .then(function(job){
          return expect(job).to.have.property("FutureActionDate");
        })
    })
  });

});
