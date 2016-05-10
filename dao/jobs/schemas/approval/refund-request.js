var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    approval = require('./approval.js');

module.exports = {
  RefundRequestJobFields: extend(owl.deepCopy(approval.ApprovalJobFields), {
    Amount:  { type:Number, required:false },
    WriteOffType: { type:Number, required:false},
    PaymentMethod: { type:Number, required:false },
    Department: { type:Number, required:false },
    DepartmentName: String,
    RequestNumber: { type:Number, required:false },
    Payee: String,
    NoLossToFirstmac: Boolean,
    VisaCardFraudRelated: Boolean
  })
}
