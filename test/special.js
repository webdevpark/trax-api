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
    mongoose = require('mongoose'),
    schemas= require('../dao/jobs/schemas');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api,
    Serial = dao.util.models.Serial;

hippie.assert.showDiff = true;

describe('/special routes', function(){

  beforeEach(function(done){
    Serial.remove().then(function(){
      done();
    });
  });

  describe('POST /special/refund-request', function(){
    describe('with valid request', function(){
      it('should create a job with the requested parameters', function(done){

        var request = require('./api-mocks/special/refund-request-request-1');
        api(function(apiServer){
          return apiServer
            .post('/special/refund-request')
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findOne({_id: body._id})
                .then(function(job){
                  var assertions = [
                    hippie.assert(job.JobType.Description, "Refund Request", 'job type'),
                    hippie.assert(job.Identities.RefundRequestSerial[0],'1', "serial"),
                    hippie.assert(job.Partitioning.Department[0], request.DepartmentId.toString(), "department id"),
                    hippie.assert(job.Identities.TontoApplicationId[0],request.Identities.TontoApplicationId[0], "identities"),
                    hippie.assert(job.WriteOffType, request.WriteOffType, "write off type id"),
                    hippie.assert(job.Amount, request.Amount, "amount"),
                    hippie.assert(job.PaymentMethodId, request.paymentMethodId, "payment method id"),
                    hippie.assert(job.Description, request.ReasonForLoss, "reason for loss"),
                    hippie.assert(job.Payee, request.Payee, "payee"),
                    hippie.assert(job.NoLossToFirstmac, request.NoLossToFirstmac, "no loss to firstmac"),
                    hippie.assert(job.VisaCardFraudRelated, request.VisaCardFraudRelated, "visa card fraud related"),
                    hippie.assert(job.RequestNumber, 1, 'request number')
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
  });

  describe('POST /special/funds-register', function(){
    describe('with valid request', function(){
      it('should create a job with the requested parameters', function(done){

        var request = require('./api-mocks/special/funds-register-request-1');
        api(function(apiServer){
          return apiServer
            .post('/special/funds-register')
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findOne({_id: body._id})
                .then(function(job){
                  var assertions = [
                    hippie.assert(job.JobType.Description, "Request a Payment", 'job type'),
                    hippie.assert(job.Identities.PaymentRequestSerial[0],'1', "serial"),
                    hippie.assert(job.LineItems[0].Purpose, request.LineItems[0].Purpose, "purpose"),
                    hippie.assert(job.LineItems[0].Amount, request.LineItems[0].Amount, "amount"),
                    hippie.assert(job.LineItems[0].From.AccountName, request.LineItems[0].From.AccountName, "from account name"),
                    hippie.assert(job.LineItems[0].From.AccountNumber, request.LineItems[0].From.AccountNumber, "from account number"),
                    hippie.assert(job.LineItems[0].From.Bsb, request.LineItems[0].From.Bsb, "from account bsb"),
                    hippie.assert(job.LineItems[0].To.AccountName, request.LineItems[0].To.AccountName, "to account name"),
                    hippie.assert(job.LineItems[0].To.AccountNumber, request.LineItems[0].To.AccountNumber, "to account number"),
                    hippie.assert(job.LineItems[0].To.Bsb, request.LineItems[0].To.Bsb, "to account bsb"),
                    hippie.assert(job.RequestNumber, 1, 'request number')
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
  });

  describe('POST /special/purchase-order', function(){
    describe('with valid request', function(){
      it('should create a job with the requested parameters', function(done){

        var request = require('./api-mocks/special/purchase-order-request-1')
        api(function(apiServer){
          return apiServer
            .post('/special/purchase-order')
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findOne({_id: body._id})
                .then(function(job){

                  var assertions = [
                    hippie.assert(job.JobType.Description, "Purchase Order", 'job type'),
                    hippie.assert(job.Identities.PurchaseOrderSerial[0],'1', "serial"),
                    hippie.assert(job.LineItems[0].Description, request.LineItems[0].Description, "line item description"),
                    hippie.assert(job.LineItems[0].Price, request.LineItems[0].Price, "line item price"),
                    hippie.assert(job.LineItems[0].Tax, request.LineItems[0].Tax, "line item tax"),
                    hippie.assert(job.Company, request.CompanyId, "company"),
                    hippie.assert(job.PurchaseOrderFormType, request.PurchaseOrderFormTypeId, "form type"),
                    hippie.assert(moment(job.OrderDate).toDate(), moment(request.OrderDate).toDate(), "order date"),
                    hippie.assert(job.Department, request.DepartmentId, "department id"),
                    hippie.assert(job.DepartmentName, "Sales", "department name"), //department id 1 in test database = 'Sales'
                    hippie.assert(job.VendorName, request.VendorName, "vendor name"),
                    hippie.assert(job.VendorReference, request.VendorReference, "vendor reference"),
                    hippie.assert(job.RequestNumber, 1, 'request number')
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
  });

  describe('POST /special/expense-claim', function(){
    describe('with valid request', function(){
      it('should create a job with the requested parameters', function(done){

        var request = require('./api-mocks/special/expense-claim-request-1')
        api(function(apiServer){
          return apiServer
            .post('/special/expense-claim')
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findOne({_id: body._id})
                .then(function(job){
                  var assertions = [
                    hippie.assert(job.JobType.Description, "Expense Claim", 'job type'),
                    hippie.assert(job.Partitioning.Department[0], request.DepartmentId.toString(), "department id"),
                    hippie.assert(job.Identities.ExpenseClaimSerial[0],'1', "serial"),
                    hippie.assert(moment(job.Period.From).toDate(), moment(request.Period.From).toDate(), "period from"),
                    hippie.assert(moment(job.Period.To).toDate(), moment(request.Period.To).toDate(), "period to"),
                    hippie.assert(job.Expenses[0].Description, request.Expenses[0].Description, "expense description"),
                    hippie.assert(job.Expenses[0].Cost, request.Expenses[0].Cost, "expense cost"),
                    hippie.assert(job.Expenses[0].Category, request.Expenses[0].Category, "expense category"),
                    hippie.assert(moment(job.Expenses[0].When).toDate(), moment(request.Expenses[0].When).toDate(), "expense when"),
                    hippie.assert(job.RequestNumber, 1, 'request number')
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
  });

  describe('POST /special/fits', function(){
    describe('with valid fits request', function(){
      it('should create a job with the requested parameters', function(done){
        var request = require('./api-mocks/special/fits-request-1');
        api(function(apiServer){
          return apiServer
            .post('/special/fits')
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findOne({_id: body._id})
                .then(function(job){
                  var assertions = [
                    hippie.assert(job.JobType.Description, "FITS Approval", 'job type'),
                    hippie.assert(job.Identities.FITSRequestNumber[0],'1', "serial"),
                    hippie.assert(job.Description, request.Description, "description"),
                    hippie.assert(job.Partitioning.Department[0], request.DepartmentId.toString(), "department id"),
                    hippie.assert(job.Department, request.DepartmentId, "department"),
                    hippie.assert(job.Category, request.Category.toString(), "category"),
                    hippie.assert(job.Project, request.ProjectId.toString(), "project id"),
                    hippie.assert(job.ProjectName, "Broker", "project name"),
                    hippie.assert(job.WorkType, request.WorkTypeId.toString(), "work type id"),
                    hippie.assert(job.WorkTypeName, "Design", "work type name"),
                    hippie.assert(job.RequestType, request.RequestType, "request type"),
                    hippie.assert(job.RequiredChanges, request.RequiredChanges, "required changes"),
                    hippie.assert(job.ChangeDriver, request.ChangeDriverId.toString(), "change driver id"),
                    hippie.assert(job.ChangeDriverName, "Revenue/Sales", "change driver name"),
                    hippie.assert(job.ComplianceDate, moment(request.ComplianceDate).toDate(), "compliance date"),
                    hippie.assert(job.Justification, request.Justification, "justification"),
                    hippie.assert(job.FitsPriority, request.FitsPriority, "fits priority"),
                    hippie.assert(job.ITEstimate, request.ITEstimate, "it estimate"),
                    hippie.assert(job.MarketingEstimate, request.MarketingEstimate, "marketing estimate"),
                    hippie.assert(job.RequestNumber, 1, 'request number')
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

    describe('with valid executive fits request', function(){

      it('should create a job with the requested parameters', function(done){
        var request = require('./api-mocks/special/executive-fits-request-1');
        api(function(apiServer){
          return apiServer
            .post('/special/fits')
            .send(request)
            .expectStatus(200)
            .expect(function(res, body, next){
              ActivityBase.findOne({_id: body._id})
                .then(function(job){
                  var assertions = [
                    hippie.assert(job.JobType.Description, "Executive FITS", 'job type'),
                    hippie.assert(job.Identities.FITSRequestNumber[0],'1', "serial"),
                    hippie.assert(job.Description, request.Description, "description"),
                    hippie.assert(job.FitsPriority, request.FitsPriority, "fits priority"),
                    hippie.assert(job.StartDate, moment(request.StartDate).toDate(), "start date"),
                    hippie.assert(job.EndDate, moment(request.EndDate).toDate(), "end date"),
                    hippie.assert(job.RequestNumber, 1, 'request number')
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
  });
});
