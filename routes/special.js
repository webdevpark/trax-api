"use strict"

var fm        = require('fm-api-common'),
    logger    = fm.logger,
    Q         = require('q'),
    _         = require('lodash'),
    mongoose  = require('mongoose'),
    restify   = require('restify'),
    dao       = require('../dao'),
    moment    = require('moment'),
    ObjectId  = mongoose.Types.ObjectId;

var jobHelper     = require('../lib/job-helper'),
    queryHelper   = require('../lib/query-helper'),
    filesHelper   = require('../lib/files-helper'),
    serialService = require('../lib/serial-service'),
    TraxClient    = require('../lib/client').TraxClient

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    nullPromise = Q.fcall(function(){return null;});

var SpecialRoutes = function(){};

SpecialRoutes.prototype.refundRequest = function(req, res, next) {

  logger.info("creating a refund request job");

  let jobId = null;
  let serialNumber = null;
  let client = new TraxClient({ token: req.headers.authorization });
  let department = null

  var work = [
    dao.ctrl.JobType.findOne({ where: { description: "Refund Request" }}),
    dao.ctrl.Department.findOne({where: {iD: req.body.DepartmentId}}),
    serialService.getNext("Refund Request")
  ];

  return Q.all(work)
    .spread(function(jobType, dep, serial) {
      serialNumber = serial.Counter;
      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate the refund request job type`));
      }
      if (!dep) {
        return next(new restify.InvalidArgumentError(`Unable to locate a department ${req.body.DepartmentId}`));
      }
      department = dep;
      var work = [];
      if (req.body.Attachments) {
        work.push(filesHelper.uploadAttachments(req.body.Attachments));
      } else {
        work.push(Q.fcall(function(){return null}));
      }
      let identities = req.body.Identities;
      identities.RefundRequestSerial = [serialNumber.toString()];
      work.push(client.createAndRetrieveJob({
        "Title": "Refund Request",
        "Description": req.body.ReasonForLoss,
        "JobTypeId": jobType.iD,
        "Identities": identities,
        "Partitions": {
          "Department": [ req.body.DepartmentId.toString() ]
        }
      }));
      return Q.all(work);
    }).spread(function(attachments, jobRes){

      let job = jobRes.body;
      jobId = job._id;
      job.Attachments = attachments;
      job.Amount = req.body.Amount;
      job.WriteOffType = req.body.WriteOffType;
      job.PaymentMethod = req.body.PaymentMethodId;
      job.Department = req.body.DepartmentId;
      job.DepartmentName = department.name;
      job.Payee = req.body.Payee;
      job.NoLossToFirstmac = req.body.NoLossToFirstmac;
      job.VisaCardFraudRelated = req.body.VisaCardFraudRelated;
      job.RequestNumber = serialNumber;
      return client.update(job._id, job);
    }).then(function(jobRes){
      res.send({
        _id:jobId,
        serial:serialNumber
      });
    })
    .catch(next)
    .done();;
}

SpecialRoutes.prototype.fundsRegister = function(req, res, next) {

  logger.info("creating a funds register job");

  let jobId = null;
  let serialNumber = null;
  let client = new TraxClient({ token: req.headers.authorization });

  var work = [
    dao.ctrl.JobType.findOne({ where: { description: "Request a Payment" }}),
    serialService.getNext("Request a Payment")
  ];

  return Q.all(work)
    .spread(function(jobType, serial) {
      serialNumber = serial.Counter;
      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate the funds register job type`));
      }

      var work = [];
      if (req.body.Attachments) {
        work.push(filesHelper.uploadAttachments(req.body.Attachments));
      } else {
        work.push(Q.fcall(function(){return null}));
      }
      work.push(client.createAndRetrieveJob({
        "Title": "Payment Request",
        "Description": req.body.Notes,
        "JobTypeId": jobType.iD,
        "Identities": {PaymentRequestSerial: [serialNumber.toString()]}
      }));
      return Q.all(work);
    }).spread(function(attachments, jobRes){

      let job = jobRes.body;
      jobId = job._id;
      job.Attachments = attachments;
      job.RegisterDate = Date.now();
      job.LineItems = req.body.LineItems;
      job.RequestNumber = serialNumber;
      return client.update(job._id, job);
    }).then(function(jobRes){
      res.send({
        _id:jobId,
        serial:serialNumber
      });
    })
    .catch(next)
    .done();;
}

SpecialRoutes.prototype.purchaseOrder = function(req, res, next) {

  logger.info("creating a purchase order job");

  let jobId = null;
  let serialNumber = null;
  let client = new TraxClient({ token: req.headers.authorization });
  let department = null

  var work = [
    dao.ctrl.JobType.findOne({ where: { description: "Purchase Order" }}),
    dao.ctrl.Department.findOne({where: {iD: req.body.DepartmentId}}),
    serialService.getNext("Purchase Order")
  ];

  return Q.all(work)
    .spread(function(jobType, dep, serial) {

      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate the purchase order job type`));
      }
      if (!dep) {
        return next(new restify.InvalidArgumentError(`Unable to locate a department ${req.body.DepartmentId}`));
      }
      serialNumber = serial.Counter;
      department = dep;
      var work = [];
      if (req.body.Attachments) {
        work.push(filesHelper.uploadAttachments(req.body.Attachments));
      } else {
        work.push(Q.fcall(function(){return null}));
      }
      work.push(client.createAndRetrieveJob({
        "Title": "Purchase Order",
        "Description": req.body.Notes,
        "JobTypeId": jobType.iD,
        "Partitions": {
          "Department": [ req.body.DepartmentId.toString() ]
        },
        "Identities": {PurchaseOrderSerial: [serialNumber.toString()]}
      }));
      return Q.all(work);
    }).spread(function(attachments, jobRes){

      let job = jobRes.body;
      jobId = job._id;
      job.Attachments = attachments;
      job.Company = req.body.CompanyId;
      job.OrderDate = moment(req.body.OrderDate);
      job.PurchaseOrderFormType = req.body.PurchaseOrderFormTypeId;
      job.Department = req.body.DepartmentId;
      job.DepartmentName = department.name;
      job.VendorName = req.body.VendorName;
      job.VendorReference = req.body.VendorReference;
      job.LineItems = req.body.LineItems
      job.RequestNumber = serialNumber;
      return client.update(job._id, job);
    }).then(function(jobRes){
      res.send({
        _id:jobId,
        serial:serialNumber
      });
    })
    .catch(next)
    .done();;
}

SpecialRoutes.prototype.expenseClaim = function(req, res, next) {

  logger.info("creating an expense claim job");

  let jobId = null;
  let serialNumber = null;
  let client = new TraxClient({ token: req.headers.authorization });
  let department = null

  var work = [
    dao.ctrl.JobType.findOne({ where: { description: "Expense Claim" }}),
    dao.ctrl.Department.findOne({where: {iD: req.body.DepartmentId}}),
    serialService.getNext("Expense Claim")
  ];

  return Q.all(work)
    .spread(function(jobType, dep, serial) {

      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate the expense claim job type`));
      }
      if (!dep) {
        return next(new restify.InvalidArgumentError(`Unable to locate a department ${req.body.DepartmentId}`));
      }
      serialNumber = serial.Counter;
      department = dep;
      var work = [];
      if (req.body.Attachments) {
        work.push(filesHelper.uploadAttachments(req.body.Attachments));
      } else {
        work.push(Q.fcall(function(){return null}));
      }
      work.push();
      work.push(client.createAndRetrieveJob({
        "Title": "Expense Claim",
        "Description": req.body.Notes,
        "JobTypeId": jobType.iD,
        "Identities": {
          ExpenseClaimSerial: serialNumber.toString()
        },
        "Partitions": {
          "Department": [ req.body.DepartmentId.toString() ]
        }
      }));
      return Q.all(work);
    }).spread(function(attachments, jobRes){

      let job = jobRes.body;
      jobId = job._id;
      job.Attachments = attachments;
      job.Period = {
          From: moment(req.body.Period.From).toDate(),
          To: moment(req.body.Period.To).toDate()
        }
      job.Department = req.body.DepartmentId;
      job.DepartmentName = department.name;
      job.Expenses = req.body.Expenses.map(function(e){
        e.When = moment(e.When);
        return e;});
      job.RequestNumber = serialNumber;
      return client.update(job._id, job);
    }).then(function(jobRes){
      res.send({
        _id:jobId,
        serial:serialNumber
      });
    })
    .catch(next)
    .done();;
}

SpecialRoutes.prototype.fits = function(req, res, next) {

  logger.info("creating a FITS job");

  let jobId = null;
  let serialNumber = null;
  let client = new TraxClient({ token: req.headers.authorization });

  var getChangeDriver = nullPromise,
      getProject      = nullPromise,
      getWorkType     = nullPromise;

  if (req.body.ChangeDriverId) {
    getChangeDriver = dao.ctrl.FitsChangeDriverType.findOne({where: {iD: req.body.ChangeDriverId}});
  }
  if (req.body.ProjectId) {
    getProject = dao.ctrl.FitsProjectType.findOne({where: {iD: req.body.ProjectId}});
  }
  if (req.body.WorkTypeId) {
    getWorkType  = dao.ctrl.FitsWorkType.findOne({where:{iD: req.body.WorkTypeId}});
  }

  var jobTypeDescription = req.body.IsExecutiveFits ? "Executive FITS" : "FITS Approval";

  var work = [
    dao.ctrl.JobType.findOne({ where: { description: jobTypeDescription }}),
    serialService.getNext("FITS")
  ];

  return Q.all(work)
    .spread(function(jobType, serial) {
      serialNumber = serial.Counter;
      if (!jobType) {
        return next(new restify.InvalidArgumentError(`Unable to locate the ${jobTypeDescription} job type`));
      }
      var work = [];
      if (req.body.Attachments) {
        work.push(filesHelper.uploadAttachments(req.body.Attachments));
      } else {
        work.push(nullPromise);
      }

      var createJobReq = {
        "Title": req.body.title,
        "Description": req.body.Description,
        "JobTypeId": jobType.iD,
        "Identities": {FITSRequestNumber: [serialNumber.toString()]},
      }
      if (req.body.DepartmentId) {
        createJobReq.Partitions = {Department: [req.body.DepartmentId.toString()]};
      }

      work.push(client.createAndRetrieveJob(createJobReq));
      work.push(getChangeDriver);
      work.push(getProject);
      work.push(getWorkType);
      return Q.all(work);
    }).spread(function(attachments, jobRes, changeDriver, project, workType){

      let job = jobRes.body;

      if (req.body.ChangeDriverId) {
        if (!changeDriver) {
          return next(new restify.InvalidArgumentError(`Unable to locate a change driver with id ${req.body.ChangeDriverId}`));
        }
        job.ChangeDriver = changeDriver.iD;
        job.ChangeDriverName = changeDriver.name;
      }
      if (req.body.ProjectId) {
        if (!project) {
          return next(new restify.InvalidArgumentError(`Unable to locate a project with id ${req.body.ProjectId}`));
        }
        job.Project = project.iD;
        job.ProjectName = project.name;
      }
      if (req.body.WorkTypeId) {
        if (!workType) {
          return next(new restify.InvalidArgumentError(`Unable to locate a work type with id ${req.body.WorkTypeId}`));
        }
        job.WorkType = workType.iD;
        job.WorkTypeName = workType.name;
      }

      jobId = job._id;
      job.Attachments = attachments;
      if (req.body.Category) {
        job.Category = req.body.Category.toString();
      }
      job.RequestType = req.body.RequestType;
      job.RequiredChanges = req.body.RequiredChanges;
      job.Department = req.body.DepartmentId;
      if (req.body.ComplianceDate){
        job.ComplianceDate = moment(req.body.ComplianceDate).toDate();
      }
      job.Justification = req.body.Justification;
      job.FitsPriority = req.body.FitsPriority;
      job.ITEstimate = req.body.ITEstimate;
      job.MarketingEstimate = req.body.MarketingEstimate;
      job.RequestNumber = serialNumber;
      if (req.body.StartDate) {
        job.StartDate = moment(req.body.StartDate).toDate();
      }
      if (req.body.EndDate) {
        job.EndDate = moment(req.body.EndDate).toDate();
      }
      return client.update(job._id, job);
    }).then(function(jobRes){
      res.send({
        _id:jobId,
        serial:serialNumber
      });
    })
    .catch(next)
    .done();
}

module.exports = new SpecialRoutes();
