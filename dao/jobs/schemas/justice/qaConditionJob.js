var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../../common'),
    base = require('../base');

module.exports = {
  QAConditionJob: extend(owl.deepCopy(base.CustomerJobSchemaFields), {
    Publish: {type: Boolean, required: true},
    NotWarranted: {type: Boolean, required: true},
    ConditionTypeName: String,
    ApplicationDetails: String
  })
}
