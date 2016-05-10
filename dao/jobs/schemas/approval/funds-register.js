var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    approval = require('./approval.js'),
    mongoose = require('mongoose');

    var options = {
      versionKey: false,          /* no version key on sub-objects */
      _id: false                  /* no id on sub-object */
    };

var accountSchema = mongoose.Schema({
  AccountName:    String,
  AccountNumber:  String,
  Bsb:            String
}, options);

var lineItemSchema = mongoose.Schema({
  Purpose:  String,
  From:     accountSchema,
  To:       accountSchema,
  Amount:   Number
}, options);

module.exports = {
  FundsRegisterFields: extend(owl.deepCopy(approval.ApprovalJobFields), {
    RequestNumber:  Number,
    RegisterDate:   Date,
    LineItems:      [lineItemSchema]
  })
}
