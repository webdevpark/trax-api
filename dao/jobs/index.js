"use strict"
/**
 * jobs module
 * @module jobs
 */

var models = require('./models')

module.exports = {
  common: require('./common'),
  movement: require('./movement'),
  models: require('./models')
};

module.exports.factory = function(modelType, data, archive) {

  let model = null;
  let storeModels = archive ? models.archive : models;
  switch (modelType) {

    case 'fits': model = storeModels.Fits(data);break;
    case 'future-action-job': model = new storeModels.FutureActionJob(data);break;
    case 'customer-job': model = new storeModels.CustomerJob(data); break;
    case 'lead-job': model = new storeModels.LeadJob(data); break;
    case 'approval-job': model = new storeModels.ApprovalJob(data); break;
    case 'email-job': model = new storeModels.EmailJob(data); break;
    case 'qa-condition-job': model = new storeModels.QAConditionJob(data); break;
    case 'refund-request-job': model = new storeModels.RefundRequestJob(data); break;
    case 'funds-register': model = new storeModels.FundsRegister(data); break;
    case 'purchase-order': model = new storeModels.PurchaseOrder(data); break;
    case 'expense-claim': model = new storeModels.ExpenseClaim(data); break;
    default: model = new storeModels.CustomerJob(data); break;

  }

  model._t = model.constructor.modelName;

  return model;

}
