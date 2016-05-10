/**
 * Movement structures
 * @module dao/jobs/movement
 */

var mongoose = require('mongoose'),
    Q        = require('q'),
    common   = require('./common'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var options = {
  discriminatorKey: '_t',     /* inheritance to use _t */
  versionKey: false           /* no version key on sub-objects */
};


/**
 * ActivityMovement schema
 * Describes when, why and the resolution to an action. It's also the base
 * container for the action itself.
 */
var activityMovementSchema = new mongoose.Schema({
  JobId: { type: ObjectId, required: true },
  When: { type: Date, required: true },
  Reason: String,
  Wrapup: common.schemas.Wrapup
}, options);

var ActivityMovement = mongoose.model('ActivityMovement', activityMovementSchema, 'movements')

/**
 * UserAssignmentTarget schema
 * User assignment is a specialised target, used for when a job is assigned to
 * a user
 */
var userAssignmentTargetSchema = mongoose.Schema({
  Who: { type: common.schemas.User },
  To: common.schemas.User,
  Priority: Number
}, options);

var UserAssignmentTarget = ActivityMovement.discriminator(
  'UserAssignmentTarget', userAssignmentTargetSchema
);

/**
 * StatusTarget schema
 * Defines when the status of a job changes
 */
var statusTargetSchema = mongoose.Schema({
  Who: { type: common.schemas.User },
  Status: Number
}, options);

var StatusTarget = ActivityMovement.discriminator(
  'StatusTarget', statusTargetSchema
);

/**
 * CreatedTarget schema
 * Defines when a job has been created
 */
var createdTargetSchema = new mongoose.Schema({
  Who: { type: common.schemas.User }
}, options);

var CreatedTarget = ActivityMovement.discriminator(
  'CreatedTarget', createdTargetSchema
);

/**
 * FollowUpTarget schema
 * When a job has a follow-up date applied to it, this target will hold all
 * of the date information
 */
var followUpTargetSchema = new mongoose.Schema({
  Who: { type: common.schemas.User },
  FollowUpDue: Date
}, options);

var FollowUpTarget = ActivityMovement.discriminator(
  'FollowUpTarget', followUpTargetSchema
);

/**
 * FollowUpCompleteTarget schema
 * When a follow-up is satisfied on a job, this movement marks the point
 * of completion
 */
var followUpCompleteTargetSchema = new mongoose.Schema({
  Who: { type: common.schemas.User }
}, options);

var FollowUpCompleteTarget = ActivityMovement.discriminator(
  'FollowUpCompleteTarget', followUpCompleteTargetSchema
);

/**
 * JobTypeChangeTarget schema
 * When a job's type changes, this movement outlines the previous and
 * new job types
 */
var jobTypeChangeTargetSchema = new mongoose.Schema({
  Who: { type: common.schemas.User },
  NewJobType: { type: common.schemas.JobType, required: true },
  OldJobType: { type: common.schemas.JobType, required: true }
}, options);

var JobTypeChangeTarget = ActivityMovement.discriminator(
  'JobTypeChangeTarget', jobTypeChangeTargetSchema
);

/**
 * JobIdentitiesChangeTarget schema
 * When a job's identities change, this movement lists the pre and post
 * identity values
 */
var jobIdentitiesChangeTargetSchema = new mongoose.Schema({
  Who: { type: common.schemas.User },

  NewIdentities: {
    type: common.schemas.IdentitySet,
    required: true
  },

  OldIdentities: {
    type: common.schemas.IdentitySet,
    required: true
  }
}, options);

var JobIdentitiesChangeTarget = ActivityMovement.discriminator(
  'JobIdentitiesChangeTarget', jobIdentitiesChangeTargetSchema
);

/**
 * ApprovalGateTarget schema
 *
 * Approval gate targets take history of the movements of workflow actions
 * throughout a job's lifetime
 */
var approvalGateTargetSchema = mongoose.Schema({
  Who: { type: common.schemas.User },
  GateName: String,
  Outcome: Number
}, options);

var ApprovalGateTarget = ActivityMovement.discriminator(
  'ApprovalGateTarget', approvalGateTargetSchema
);

module.exports = {
  ApprovalGateTarget       : ApprovalGateTarget,
  CreatedTarget            : CreatedTarget,
  FollowUpCompleteTarget   : FollowUpCompleteTarget,
  FollowUpTarget           : FollowUpTarget,
  JobIdentitiesChangeTarget: JobIdentitiesChangeTarget,
  JobTypeChangeTarget      : JobTypeChangeTarget,
  StatusTarget             : StatusTarget,
  UserAssignmentTarget     : UserAssignmentTarget,
  ActivityMovement         : ActivityMovement,
};
