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
    serialService = require('../lib/serial-service'),
    server    = require('../server'),
    common    = require('./common'),
    Q         = require('q'),
    moment    = require('moment'),
    mongoose = require('mongoose');

var Serial = dao.util.models.Serial;

hippie.assert.showDiff = true;
describe('serial-service', function() {
  before(function(done){
    var serial1 = new Serial({
      Name: "Serial 1",
      Counter: 1
    });
    serial1.save()
      .then(function(){
      done();
    });
  });

  it('should increment existing counter', function(done) {
    serialService.getNext('Serial 1')
      .then(function(result){
        expect(result.Counter).to.equal(2);
        done();
      })
      .catch(done);
  });
  it('should create new counter for new name', function(done) {
    serialService.getNext('Serial New')
      .then(function(result){
        expect(result.Counter).to.equal(1);
        done();
      })
      .catch(done);
  });
});
