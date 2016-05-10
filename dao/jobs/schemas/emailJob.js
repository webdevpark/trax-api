var extend = require('extend'),
    owl = require('owl-deepcopy'),
    common = require('../common'),
    base = require('./base');

module.exports = {
  EmailJobFields: extend(owl.deepCopy(base.CustomerJobSchemaFields), {
    Sender: String,
    Subject: String,
    FurtherActionAddress: String
  })
}
