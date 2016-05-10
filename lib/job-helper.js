"use strict"
/**
 * Common job object helper
 * @module lib/job-helper.js
 */

var Q         = require('q'),
    dao       = require('../dao'),
    fm        = require('fm-api-common'),
    logger    = fm.logger;


var UserAdapter = require('./user-adapter').UserAdapter;

var JobHelper = function () { };
/**
 * Creates a user data object from an authentication cookie
 * @func makeUser
 * @param user {Object} The user
 */
JobHelper.prototype.makeUser = function (user) {

  var adapter = new UserAdapter(user);

  if (adapter.isAnonymous()) {

    return {
      TontoUserId: null,
      EmailAddress: null,
      FullName: 'Anonymous'
    };

  }

  return {
    TontoUserId: adapter.getCrumbsLoginId(),
    EmailAddress: adapter.getEmail(),
    FullName: adapter.getName()
  };

};

/**
 * Creates a user data object from an email address
 * @func makeUserFromEmail
 * @param emailAddress {String} The user's email address
 * @remarks This will hit the user store in the control database/or elsewhere
 */
JobHelper.prototype.makeUserFromEmail = function (emailAddress) {
  return dao.ctrl.User.findOne({ where: { emailAddress: emailAddress } })
    .then(function (user) {
      if (!user){
        return {
          TontoUserId: null,
          EmailAddress: '',
          Name: 'Job System'
        };
      }
      return {
        TontoUserId: user.tontoUserId,
        EmailAddress: user.emailAddress,
        FullName: user.fullName
      };

    });

};

/**
 * Creates an activity movement object
 * @func makeMovement
 * @param who {Object} The user creating the movement
 */
JobHelper.prototype.makeMovement = function (who, when) {

  return {
    Who: this.makeUser(who),
    When: when || new Date()
  };

};

/**
 * Creates a wrap-up DTO for the given id
 * @func makeWrapup
 * @param id {Number} The id of the wrap up
 */
JobHelper.prototype.makeWrapup = function (id) {

  return dao.ctrl.WrapUpValue.findOne({ where: { id: id } })
    .then(function (wrapup) {

      // take null if the wrap up wasn't found
      if (!wrapup) { return null; }

      return {
        ValueId: wrapup.iD,
        Text: wrapup.value
      };

    });

};

/**
 * Creates a wrap-up DTO for the given name
 * @func makeWrapupFromName
 * @param name {String} The name of the wrap up
 */
JobHelper.prototype.makeWrapupFromName = function (name) {

  return dao.ctrl.WrapUpValue.findOne({ where: { Value: name } })
    .then(function (wrapup) {

      // take null if the wrap up wasn't found
      if (!wrapup) { return null; }

      return {
        ValueId: wrapup.iD,
        Text: wrapup.value
      };

    });

};

JobHelper.prototype.writeMovement = function (id, type, data, reason, wrapUp) {

  return Q.Promise((resolve, reject, progress) => {

    var model = null;

    switch (type) {

      case 'created':
        model = dao.jobs.movement.CreatedTarget;
        break;

      case 'follow-up-complete':
        model = dao.jobs.movement.FollowUpCompleteTarget;
        break;

      case 'follow-up':
        model = dao.jobs.movement.FollowUpTarget;
        break;

      case 'job-identities-change':
        model = dao.jobs.movement.JobIdentitiesChangeTarget;
        break;

      case 'job-type-change':
        model = dao.jobs.movement.JobTypeChangeTarget;
        break;

      case 'status':
        model = dao.jobs.movement.StatusTarget;
        break;

      case 'user-assignment':
        model = dao.jobs.movement.UserAssignmentTarget;
        break;

      case 'approval-gate':
        model = dao.jobs.movement.ApprovalGateTarget;
        break;

      default:
        return reject(new Error(`Invalid activity history instruction: "${type}"`));
    }

    var wrapUpPromise = !wrapUp ? Q(null) : self.makeWrapup(wrapUp);

    wrapUpPromise.then((wrapUpObject) => {

      var innerData = data || { };

      innerData.JobId  = id;
      innerData.When   = new Date();
      innerData.Reason = reason;
      innerData.Wrapup = wrapUpObject;

      var record = new model(innerData);
      return record.save()
        .then((doc) => {
          return resolve(doc);
        });

    })
    .catch(reject)
    .done();

  });

};

module.exports = new JobHelper();
