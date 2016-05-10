/**
 * Common data structures
 * @module dao/jobs/common
 */


var mongoose = require('mongoose');

var options = {
  discriminatorKey: '_t',     /* inheritance to use _t */
  versionKey: false,          /* no version key on sub-objects */
  _id: false                  /* no id on sub-object */
};

/**
 * Identity set schema
 * Details all of the possible identity sets that can be attached to a job
 * @discuss Should we be strongly defining the identity set?
 */
var identitySetSchema = new mongoose.Schema({
  TontoApplicationId          : { type: [String], required: false },
  BureauApplicationId         : { type: [String], required: false },
  UltracsXref                 : { type: [String], required: false },
  UltracsAccount              : { type: [String], required: false },
  UltracsClient               : { type: [String], required: false },
  CallsLeadId                 : { type: [String], required: false },
  K2Serial                    : { type: [String], required: false },
  CrmActivityGuid             : { type: [String], required: false },
  CrmAccountGuid              : { type: [String], required: false },
  CrmContactGuid              : { type: [String], required: false },
  CrmCallerGuid               : { type: [String], required: false },
  CrmCampaignGuid             : { type: [String], required: false },
  RetailApplicationId         : { type: [String], required: false },
  ExpenseClaimSerial          : { type: [String], required: false },
  PaymentRequestSerial        : { type: [String], required: false },
  PurchaseOrderSerial         : { type: [String], required: false },
  RefundRequestSerial         : { type: [String], required: false },
  ApplicationPartyRoleId      : { type: [String], required: false },
  FITSRequestNumber           : { type: [String], required: false },
  ApplicationConditionId      : { type: [String], required: false },
  ComplaintInvestigationSerial: { type: [String], required: false },
  ProductManagerRequestSerial : { type: [String], required: false },
  RetentionRateRequestSerial  : { type: [String], required: false },
  v8ApplicationContainer      : { type: [String], required: false },
  v8ApplicationPartyRole      : { type: [String], required: false }
}, options);

/**
 * Partition set schema
 * Details all of the possible partition sets that can be attached to a job
 */
var partitionSetSchema = new mongoose.Schema({
  RetailShop          : { type: [String], required: false },
  Office              : { type: [String], required: false },
  Team                : { type: [String], required: false },
  Broker              : { type: [String], required: false },
  Originator          : { type: [String], required: false },
  BDM                 : { type: [String], required: false },
  Solicitor           : { type: [String], required: false },
  Funder              : { type: [String], required: false },
  Valuer              : { type: [String], required: false },
  MortgageInsurer     : { type: [String], required: false },
  RetailChannel       : { type: [String], required: false },
  RetailReferrer      : { type: [String], required: false },
  RetailSalesperson   : { type: [String], required: false },
  RetailCreationSource: { type: [String], required: false },
  RetailBrand         : { type: [String], required: false },
  TimeZone            : { type: [String], required: false },
  Department          : { type: [String], required: false },
  ApprovalStage       : { type: [String], required: false }
}, options);

/**
 * User schema
 * This structure is how a user is referenced in the job database
 */
var userSchema = new mongoose.Schema({
  TontoUserId: Number,
  EmailAddress: String
}, options);

/**
 * UserDate schema
 * The schema simply pairs a user and date together
 */
var userDateSchema = new mongoose.Schema({
  User: { type: userSchema, required: true },
  When: { type: Date, required: true }
}, options);

/**
 * Wrapup schema
 * When an action occurs, it can have a wrap up associated to it at the event's
 * completion. This schema is filled from the wrap up table and assigned to
 * different attributes
 */
var wrapupSchema = new mongoose.Schema({
  ValueId: { type: Number, required: true },
  Text: { type: String, required: true }
}, options);

/**
 * MovementBase schema
 * Pairs a date with a user
 */
var movementBaseSchema = new mongoose.Schema({
  Who: { type: userSchema, required: true },
  When: { type: Date, required: true }
}, options);

/**
 * JobType schema
 * Defines the job type, built from JobType records in the control database
 */
var jobTypeSchema = new mongoose.Schema({
  JobTypeId: { type: Number, required: true },
  Description: String,
  TypeCode: String
}, options);

/**
 * Gate schema
 * Defines a single gate of the job approval process
 */
var gateSchema = new mongoose.Schema({
  Stage: { type: String, required: true },
  Checked: userDateSchema,
  Outcome: Number,
  Comments: String
}, options);

var applicationStateSchema = new mongoose.Schema({
    BureauApplicationId: String,
    TontoApplicationId: String,
    V8ApplicationId: String,
    State: Number
}, options);

module.exports = {

  models: {

  },

  schemas: {

    Gate: gateSchema,
    IdentitySet: identitySetSchema,
    JobType: jobTypeSchema,
    MovementBase: movementBaseSchema,
    PartitionSet: partitionSetSchema,
    UserDate: userDateSchema,
    User: userSchema,
    Wrapup: wrapupSchema,
    ApplicationState: applicationStateSchema
  }

};
