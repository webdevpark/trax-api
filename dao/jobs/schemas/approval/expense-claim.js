var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    approval = require('./approval.js'),
    mongoose = require('mongoose');

var options = {
  versionKey: false,          /* no version key on sub-objects */
  _id: false                  /* no id on sub-object */
};

var dateRangeSchema= mongoose.Schema({
  From: Date,
  To: Date
}, options);

var expenseSchema = mongoose.Schema({
  When: Date,
  Description: String,
  Category: Number,
  Cost: Number
}, options);

module.exports = {
  ExpenseClaimFields: extend(owl.deepCopy(approval.ApprovalJobFields), {
    RequestNumber: Number,
    Department: Number,
    DepartmentName: String,
    Period: dateRangeSchema,
    Expenses: [expenseSchema]
  })
}
