var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    approval = require('./approval.js'),
    mongoose = require('mongoose');

var options = {
  versionKey: false,          /* no version key on sub-objects */
  _id: false                  /* no id on sub-object */
};

module.exports = {
  FitsFields: extend(true, owl.deepCopy(approval.ApprovalJobFields), {
    Department: Number,
    Category: String,
    Project: String,
    ProjectName: String,
    WorkType: String,
    WorkTypeName: String,
    RequestType: String,
    RequiredChanges: String,
    ChangeDriver: String,
    ChangeDriverName: String,
    ComplianceDate: Date,
    Justification: String,
    FitsPriority: Number,
    ITEstimate: Number,
    MarketingEstimate: Number,
    RequestNumber: Number,
    StartDate: Date,
    EndDate: Date
  })
}
