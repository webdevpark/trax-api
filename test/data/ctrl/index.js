'use strict'

var fm        = require('fm-api-common'),
    logger    = fm.logger,
    Q         = require('q'),
    _         = require('lodash'),
    dao       = require('../../../dao'),
    config    = require('config');

var ctrlDb = config.get('trax-ctrl-db');

if (ctrlDb.host == "172.21.30.151") {
  //dao.ctrl.Department.destroy({truncate:true});
  //dao.ctrl.Department.create({iD:1, name:"Sales", active:1, isPausable:0});


}
