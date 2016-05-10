var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    base = require('../base');

module.exports = {
  LeadJobFields: extend(owl.deepCopy(base.CustomerJobSchemaFields), {

    BestTimeToCall: String,
    Surname: String,
    Salesperson: String,
    BestContactNumber: String,
    Product: String,
    Brand: String,
    CallsFollowUpDate: Date,
    Channel: String,
    SalesSupport: String,
    LoanPurpose: String,
    LVR: String,
    LoanAmount: String,
    SalesStatus: String,
    LastHistoryNote: String,
    AutomatedCorrespondenceSent: Boolean,
    NewStatusId: Number,
    ShouldCrashApplication: Boolean,
    ShouldCrashLead: Boolean,
    LeadCrashReason: String,
    NotCrashingInJusticeReason: String,
    NotCrashingInV8Reason: String,
    CreateLivebrokerJob: Boolean,
    Grade: Number,
    ApplicationIdToCrash: String,
    ApplicationStates: [common.schemas.ApplicationState],
    PrimaryEmailAddress: String,
    PrimaryCustomerId: {type: Number, required: true},
    HasHomeLoanApplication: {type: Boolean, required: true},
    V8CrashTypeId: Number,
    V8CrashReasonId: Number
  })
}
