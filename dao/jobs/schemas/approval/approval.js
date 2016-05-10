/**
 * Approval job structures
 * @module dao/jobs/approval
 */

var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    base     = require('../base');

module.exports = {
  ApprovalJobFields: extend(true, owl.deepCopy(base.CustomerJobFields), {
      Gates: [common.schemas.Gate]
  })
}
