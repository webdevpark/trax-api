var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    approval = require('./approval.js'),
    mongoose = require('mongoose');

var options = {
  versionKey: false,          /* no version key on sub-objects */
  _id: false                  /* no id on sub-object */
};

var lineItemsSchema = mongoose.Schema({
  Description: String,
  Price: Number,
  Tax: Number
}, options);

module.exports = {
  PurchaseOrderFields: extend(owl.deepCopy(approval.ApprovalJobFields), {
    Company: Number,
    RequestNumber: Number,
    PurchaseOrderFormType: Number,
    OrderDate: Date,
    Department: Number,
    DepartmentName: String,
    VendorName: String,
    VendorReference: String,
    LineItems: [lineItemsSchema]
  })
}
