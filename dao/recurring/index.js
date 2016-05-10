'use strict'


var mongoose = require('mongoose'),
    connections = require("../connections"),
    common = require('../jobs/common'),
    schemas   = require('../jobs/schemas'),
    ArchiveCustomerJobSchema = schemas.archive.CustomerJob;

var ObjectId  = mongoose.Schema.Types.ObjectId;

var options = {
  versionKey: false,          /* no version key on sub-objects */
  collection: "recurring"
};

var recurringSchema = mongoose.Schema({
  JobTemplateId: {type:ObjectId, required:true},
  Schedule: mongoose.Schema({
    Description: String,
    Title: String,
    StartDate: {type:Date, required:true},
    EndDate: Date,
    MaxNumOccurrences: Number,
    Interval: Number,
    Monday: Boolean,
    Tuesday: Boolean,
    Wednesday: Boolean,
    Thursday: Boolean,
    Friday: Boolean,
    Saturday: Boolean,
    Sunday: Boolean,
    DayOfMonth: Number,
    WeekOfMonth: Number,
    MonthOfYear: Number,
    LastCreatedDate: Date,
    RecurrenceFrequencyType: Number,
    Assignee: {type: common.schemas.User }
  }, options),
  Created: {type: common.schemas.UserDate}
}, options)

var recurringModel = mongoose.model("Recurring", recurringSchema);

module.exports = {
  models:{
    RecurringJob: recurringModel
  }
}
