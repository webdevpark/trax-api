/**
 * Base job data structures
 * @module dao/jobs/base
 */

var mongoose = require('mongoose'),
    common = require('../common'),
    ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = {

  ActivityBaseFields: {

    Identities  : common.schemas.IdentitySet,
    Partitioning: common.schemas.PartitionSet,

    Title      : String,
    Description: String,
    Priority   : Number,

    Attachments: [ObjectId],
    Chain      : [ObjectId],

    Created  : { type: common.schemas.MovementBase, required: false },
    Assigned : { type: common.schemas.MovementBase, required: false },
    Reserved : { type: common.schemas.MovementBase, required: false },
    Closed   : { type: common.schemas.MovementBase, required: false },
    FollowUp : { type: common.schemas.MovementBase, required: false },
    Completed: { type: common.schemas.MovementBase, required: false },
    OnHold   : { type: common.schemas.MovementBase, required: false },

    Armed   : Boolean,
    ParentId: ObjectId

  },

  CustomerJobFields : {

      JobType     : common.schemas.JobType,
      Message     : String,
      Wrapup      : common.schemas.Wrapup,
      IsArchived  : Boolean

  }
}
