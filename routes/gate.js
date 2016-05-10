"use strict";

var fm        = require('fm-api-common'),
    logger    = fm.logger,
    Q         = require('q'),
    _         = require('lodash'),
    mongoose  = require('mongoose'),
    restify   = require('restify'),
    dao       = require('../dao'),
    ObjectId  = mongoose.Types.ObjectId;

var jobHelper    = require('../lib/job-helper'),
    TraxClient   = require('../lib/client').TraxClient

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    ApprovalJob  = dao.jobs.models.ApprovalJob,
    GateOutcome  = dao.refs.gateOutcome;
/**
 * Static module to hold all gated job routes
 * @class JobRoutes
 */
var GateRoutes = function () { };

/**
 * Retrieves a job record from the database and performs some basic gate testing
 * to ensure that it's ready for use by these services
 * @func retrieveAndValidateJob
 * @param id {ObjectId} The id of the job
 */
var retrieveAndValidateJob = function (id) {

  return Q.Promise((resolve, reject, progress) => {

    // validate the id is the correct format
    if (!ObjectId.isValid(id)) {
      return reject(new restify.InvalidArgumentError(`The value "${id}" is not a valid ObjectId`));
    }

    ActivityBase.findById(id)
      .then((job) => {

        // validate that we actually got a job
        if (!job) {
          return reject(new restify.NotFoundError(id));
        }

        // gate testing on the job
        if (job.Gates == null || job.Gates.length == 0) {
          return reject(new restify.ConflictError(`No approval gates defined`));
        } else if (_.filter(
                      job.Gates,
                      g => g.Outcome == GateOutcome.NONE || g.Outcome == GateOutcome.SUSPENDED
                    ).length == 0) {
          return reject(new restify.ConflictError(`No actional gates remaining`));
        }

        // all went to plan
        return resolve(job);

      })

  });

};

/**
 * Processes the job record supplied by analysing the actionable gates, and returns
 * the most appropriate for this scenario
 * @func getActionableGate
 * @param job {Object} The job record
 */
var getActionableGate = function (job) {

  // grab the gates as the database defines them
  let getJobTypeGates = dao.ctrl.JobTypeGate.find({ where: { jobTypeID: job.JobType.JobTypeId } });

  // grab any gates that are still actionable
  let unapproveds = _.filter(job.Gates, g => g.Outcome == GateOutcome.NONE ||
                                             g.Outcome == GateOutcome.SUSPENDED);

  return getJobTypeGates.then(gates => {
    // join together the gate definitions with their detail object
    let available = _.map(unapproveds, unapproved => {

      let ret = {
        jobGate: unapproved,
        dbGate: _.filter(
          _.sortBy(gates, g => g.precedence),
          g => g.gateName == unapproved.Stage
        )
      };
      return ret
    });

    return {
      job: job,
      actionable: _.take(available, 1)[0]
    };

  });

};

/**
 * Determines if the specified user is allowed to action the gate in question
 * @func testUserCanActionGate
 * @param user {Object} The user object
 */
var testUserCanActionGate = function (state, user) {

    // these are extracted in case we need the information
    let job = state.job;
    let actionable = state.actionable;

    return Q.Promise((resolve, reject, progress) => {

      dao.ctrl.User.findOne({
        where: { emailAddress: user.EmailAddress },
        include: [ {
          model: dao.ctrl.UserDepartment,
          as: 'FKUserdepartmentUsers',
          where: { roleID: actionable.dbGate.roleID }
        } ]
      }).then(userRecord => {
        console.log(userRecord);
        // handle not authorized where a user isn't in the control database
        if (!userRecord) {
          return reject(new restify.NotAuthorizedError(`User could not be located in the control database`));
        }

        // user don't posses the required role; this is an un-authorized condition
        if (userRecord.FKUserdepartmentUsers.length == 0) {
          return reject(new restify.NotAuthorizedError(`User is not authorized to action this gate`));
        }

        // pass-through!
        return resolve(state);

      });

    });

};

/**
 * Approves a trax approval gate
 * @func approve
 * @param req Object The incoming request
 * @param res Object The outgoing response
 * @param next Function The next middleware function
 */
GateRoutes.prototype.approve = function (req, res, next) {
  let user = jobHelper.makeUser(req.user);

  return retrieveAndValidateJob(req.params.id)
    .then(getActionableGate)
    .then(state => testUserCanActionGate(state, user))
    .then(function (state) {
      let job = state.job;
      let actionable = state.actionable.jobGate;

      // update the gate
      actionable.Outcome = GateOutcome.APPROVED;
      actionable.Checked = {
        User: user,
        When: new Date()
      };
      actionable.Comments = req.body.Comments;

      return getActionableGate(job)
        .then(function (updatedState) {
          let job = updatedState.job;
          let updatedActionable = updatedState.actionable.jobGate;

          // update the approval stage partition
          if (updatedActionable != null) {
            job.Partitioning.ApprovalStage = [ updatedActionable.Stage ];
          }

          // save the job record off
          let saveJobPromise = job.save();

          // add an activity movement
          let movementPromise = jobHelper.writeMovement(job._id, 'approval-gate', {
            Who: jobHelper.makeUser(req.user),
            Outcome: GateOutcome.APPROVED,
            GateName: actionable.Stage
          }, req.body.Comments, null);

          return Q.all([ saveJobPromise, movementPromise ])
            .then(function () {
              res.send();
              return next();
            });
        });
    })
    .catch(next)
    .done();
};

/*
*        private void ApproveGate(string id, string comments, Ac.User user) {
*            // get the job out
*            var job = RetrieveAndValidateApprovalJob(id);
*
*            // get the gate details out for the job
*            var gate = GetActionableGate(job);
*
 *           // determine if the user is able to action the gate
 *           if (!UserCanActionGate(user, gate.Item2, job)) {
 *               throw new Exception(
 *                   String.Format("User {0} ({1}) does not have access to approve the \"{2}\" gate for this job type", user.PartyRoleID.Value.ToString(), user.FullName, gate.Item1.Stage)
 *               );
 *           }
*
 *           // update the gate
 *           gate.Item1.Outcome = GateOutcome.Approved;
 *           gate.Item1.Checked = new UserDate(CreateUser(user), DateTime.Now);
 *           gate.Item1.Comments = comments;
*
 *           // try to find the next actionable gate (now that we've filled out the current one)
 *           var nextGate = GetActionableGate(job);
*
 *           // if one was found, we need to update the partitioning on the job to maintain the flow
 *           if (nextGate != null) {
 *               // the partition indexes need to be adjusted here to reflect that we're moving on
 *               // this will help the auto-system determine who to schedule this job to next
 *               job.Partitioning[ActivityPartition.ApprovalStage.ToString("G")] = new string[] { nextGate.Item2.GateName };
 *           }
*
 *           // add an action item
 *           job.Actions.Add(new ActivityMovement() {
 *               Reason = comments,
 *               What = new ApprovalGateTarget() {
 *                   GateName = gate.Item1.Stage,
 *                   Outcome = GateOutcome.Approved,
 *                   Who = CreateUser(user)
 *               },
 *               When = DateTime.Now,
 *               Wrapup = null
 *           });
*
 *           List<string> messages = new List<string>();
*
 *           // process pre-triggers
 *           TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.BeforeGateApproved, messages, user);
*
 *           // save the job's state
 *           SaveState(job);
*
 *           // process post-triggers
 *           TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.AfterGateApproved, messages, user);
*
 *           // if all of the gates now for this job are approved - fire the approved trigger
 *           if (job.Gates.All(g => g.Outcome == GateOutcome.Approved)) {
 *               // process post-triggers
 *               TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.AfterApproved, messages, user);
*
 *               // complete the job now
 *               // CompleteJob(id, "All approval gates have been met", (int?)null, user);
*
 *               // TODO: change this to reassign to whoever is in the "FITS Manager" role for the department selected on the FITS
 *               // Offload this processing onto the trigger
 *           }
 *           else {
 *               //if the current approving user is also in the role to approve the next gate, auto approve it.
*
 *               //refresh job and gate state - triggers have run and may have auto approved a stage.
 *               job = (ApprovalJob)new JobReportService().Get(job._id);
 *               nextGate = GetActionableGate(job);
*
 *               //now check again if all gates approved (triggers may have auto approved the final stage) - don't run after approved trigger if so, because it would have already run
 *               if (job.Gates.All(g => g.Outcome == GateOutcome.Approved))
 *               {
 *                   //nothing to do
 *               }
 *               else
 *               {
 *                   using (var entities = new Ac.Entities())
 *                   {
 *                       var jobDepartment = job.Partitioning[ActivityPartition.Department.ToString()].FirstOrDefault();
 *                       var roleForNextGate = entities.Roles.Find(nextGate.Item2.RoleID);
 *                       if (jobDepartment != null && roleForNextGate != null && roleForNextGate.UserDepartments.Any(ud => ud.UserID == user.ID && ud.Department.ID == int.Parse(jobDepartment)))
 *                       {
 *                           ApproveGate(id, comments, user);
 *                       }
 *                       else
 *                       {
 *                           // if there is still work to do on this job, unassign it
 *                           ReassignJob(id, null, "Job unassigned for further approval", user, (int?)null, (int?)null);
 *                       }
 *                   }
 *               }
 *           }
 *       }
*
*/

/**
 * Approves a trax approval gate
 * @func approve
 * @param req Object The incoming request
 * @param res Object The outgoing response
 * @param next Function The next middleware function
 */
GateRoutes.prototype.decline = function (req, res, next) {
  let user = jobHelper.makeUser(req.user);

  return retrieveAndValidateJob(req.params.id)
  .then(getActionableGate)
  .then(state => testUserCanActionGate(state, user))
  .then(function (state) {
    let job = state.job;
    let actionable = state.actionable.jobGate;
    // update the gate
    actionable.Outcome = GateOutcome.DECLINED;
    actionable.Checked = {
      User: user,
      When: new Date()
    };
    actionable.Comments = req.body.Comments;

    // save the job record off
    let saveJobPromise = job.save();

    // add an activity movement
    let movementPromise = jobHelper.writeMovement(job._id, 'approval-gate', {
      Who: jobHelper.makeUser(req.user),
      Outcome: GateOutcome.DECLINED,
      GateName: actionable.Stage
    }, req.body.Comments, null);

    return Q.all([ saveJobPromise, movementPromise ])

  })
  .then(function(){
    // trax client, for further requests
    var client = new TraxClient({ token: req.headers.authorization });
    return client.completeJob(req.params.id, {Reason: "Job completed from a declined approval gate"});
  })
  .then(function () {
    res.send(200);
    return next();
  })
  .catch(next)
  .done();

  /*
  *        private void DeclineGate(string id, string comments, Ac.User user) {
  *            // get the job out
  *            var job = RetrieveAndValidateApprovalJob(id);
  *
  *            // get the gate details out for the job
  *            var gate = GetActionableGate(job);
  *
  *            // determine if the user is able to action the gate
  *            if (!UserCanActionGate(user, gate.Item2, job)) {
  *                throw new Exception(
  *                    String.Format("User {0} ({1}) does not have access to approve the \"{2}\" gate for this job type", user.PartyRoleID.Value.ToString(), user.FullName, gate.Item1.Stage)
  *                );
  *            }
  *
  *            // update the gate
  *            gate.Item1.Outcome = GateOutcome.Declined;
  *            gate.Item1.Checked = new UserDate(CreateUser(user), DateTime.Now);
  *            gate.Item1.Comments = comments;
  *
  *            // add an action item
  *            job.Actions.Add(new ActivityMovement() {
  *                Reason = comments,
  *                What = new ApprovalGateTarget() {
  *                    GateName = gate.Item1.Stage,
  *                    Outcome = GateOutcome.Declined,
  *                    Who = CreateUser(user)
  *                },
  *                When = DateTime.Now,
  *                Wrapup = null
  *            });
  *
  *            List<string> messages = new List<string>();
  *
  *            // process pre-triggers
  *            TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.BeforeGateDeclined, messages, user);
  *
  *            // save the job's state
  *            SaveState(job);
  *
  *            // process post-triggers
  *            TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.AfterGateDeclined, messages, user);
  *
  *            // complete the job now
  *            CompleteJob(id, "Job completed from a declined approval gate", (int?)null, (DateTime?)null, user);
  *
  *        }
  */

};

/**
 * Removes the suspension on a trax approval gate
 * @func unsuspend
 * @param req Object The incoming request
 * @param res Object The outgoing response
 * @param next Function The next middleware function
 */
GateRoutes.prototype.unsuspend = function (req, res, next) {

  let client = new TraxClient({ token: req.headers.authorization });
  let user = jobHelper.makeUser(req.user);

  return retrieveAndValidateJob(req.params.id)
    .then(getActionableGate)
    .then(stage => testUserCanActionGate(stage, user))
    .then(function (state) {

      let job = state.job;
      let actionable = state.actionable.jobGate;

      if (actionable.Outcome != GateOutcome.SUSPENDED) {
        throw new restify.InvalidArgumentError(`The latest actionable gate for job ${req.params.id} has a current outcome of ${actionable.Outcome}. Only gates that are suspended can be unsuspended`)
      }
      // update the gate
      actionable.Outcome = GateOutcome.NONE;
      actionable.Checked = null
      actionable.Comments = null;

      // update the approval stage partition
      job.Partitioning.ApprovalStage = [ actionable.Stage ];

      // save the job record off
      let saveJobPromise = job.save();

      // add an activity movement
      let movementPromise = jobHelper.writeMovement(job._id, 'approval-gate', {
        Who: user,
        Outcome: GateOutcome.NONE,
        GateName: actionable.GateName
      }, req.body.Comments, null);

      return Q.all([ saveJobPromise, movementPromise ])
    })
    .then(() => client.putJobOnHold(req.params.id, {Reason: "Job put on hold after user unsuspended approval gate"}))
    .then(() => client.reassignJob(req.params.id, {
      Reason: req.body.comments,
      To: null,
      From: user.EmailAddress
    }))
    .then(function () {
      res.send(200);
      return next();
    })
    .catch(next)
    .done();
/*
        private void UnsuspendGate(string id, string comments, Ac.User user) {

            // get the job out
            var job = RetrieveAndValidateApprovalJob(id);

            // get the gate details out for the job
            var gate = GetActionableGate(job);

            // check that we have a gate that is currently suspended
            if (gate.Item1.Outcome != GateOutcome.Suspended) {
                throw new Exception(
                    String.Format("The latest actionable gate for job {0} has a current outcome of {1}. Only gates that are suspended can be unsuspended", id, gate.Item1.Stage)
                );
            }

            // update the gate
            gate.Item1.Outcome = GateOutcome.None;
            gate.Item1.Checked = null;
            gate.Item1.Comments = null;

            // when unsuspending a gate, the job needs to be add back into the approval
            // process. Do this by setting the stage to where we need to get to
            job.Partitioning[ActivityPartition.ApprovalStage.ToString("G")] = new string[] { gate.Item1.Stage };

            // add an action item
            job.Actions.Add(new ActivityMovement() {
                Reason = comments,
                What = new ApprovalGateTarget() {
                    GateName = gate.Item1.Stage,
                    Outcome = GateOutcome.None,
                    Who = CreateUser(user)
                },
                When = DateTime.Now,
                Wrapup = null
            });


            List<string> messages = new List<string>();

            // process pre-triggers
            TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.BeforeGateUnsuspended, messages, user);

            // save the job's state
            SaveState(job);

            // process post-triggers
            TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.AfterGateUnsuspended, messages, user);

            // put the job on-hold
            PutJobOnHold(
                id,
                DateTime.Now,
                "Job put on hold after user unsuspended approval gate",
                user,
                (int?)null
            );

            // ready to be picked up
            ReassignJob(id, null, comments, user, (int?)null, (int?)null);
        }
*/

};

/**
 * Approves a trax approval gate
 * @func approve
 * @param req Object The incoming request
 * @param res Object The outgoing response
 * @param next Function The next middleware function
 */
GateRoutes.prototype.suspend = function (req, res, next) {

  let client = new TraxClient({ token: req.headers.authorization });
  let user = jobHelper.makeUser(req.user);

  return retrieveAndValidateJob(req.params.id)
    .then(getActionableGate)
    .then(state => testUserCanActionGate(state, user))
    .then(function (state) {

      let job = state.job;
      let actionable = state.actionable.jobGate;

      // update the gate
      actionable.Outcome = GateOutcome.SUSPENDED;
      actionable.Checked = {
        User: user,
        When: new Date()
      };
      actionable.Comments = req.body.Comments;

      // update the approval stage partition
      job.Partitioning.ApprovalStage = [];

      // save the job record off
      let saveJobPromise = job.save();

      // add an activity movement
      let movementPromise = jobHelper.writeMovement(job._id, 'approval-gate', {
        Who: user,
        Outcome: GateOutcome.SUSPENDED,
        GateName: actionable.Stage
      }, req.body.Comments, null);

      return Q.all([ saveJobPromise, movementPromise ])

    })
    .then(function () {
      res.send(200);
      return next();
    })
    .catch(next)
    .done();

/*
        private void SuspendGate(string id, string comments, Ac.User user) {
            // get the job out
            var job = RetrieveAndValidateApprovalJob(id);

            // get the gate details out for the job
            var gate = GetActionableGate(job);

            // determine if the user is able to action the gate
            if (!UserCanActionGate(user, gate.Item2, job)) {
                throw new Exception(
                    String.Format("User {0} ({1}) does not have access to approve the \"{2}\" gate for this job type", user.PartyRoleID.Value.ToString(), user.FullName, gate.Item1.Stage)
                );
            }

            // update the gate
            gate.Item1.Outcome = GateOutcome.Suspended;
            gate.Item1.Checked = new UserDate(CreateUser(user), DateTime.Now);
            gate.Item1.Comments = comments;

            // when suspending a gate, the job needs to be removed from the approval
            // process temporarily. Do this by clearing the stage partition
            job.Partitioning[ActivityPartition.ApprovalStage.ToString("G")] = new string[] { };

            // add an action item
            job.Actions.Add(new ActivityMovement() {
                Reason = comments,
                What = new ApprovalGateTarget() {
                    GateName = gate.Item1.Stage,
                    Outcome = GateOutcome.Suspended,
                    Who = CreateUser(user)
                },
                When = DateTime.Now,
                Wrapup = null
            });

            List<string> messages = new List<string>();

            // process pre-triggers
            TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.BeforeGateSuspended, messages, user);

            // save the job's state
            SaveState(job);

            // process post-triggers
            TriggerActionHelper.ProcessAllTasks(job, TriggerActionPoints.AfterGateSuspended, messages, user);
        }
*/

};



module.exports = new GateRoutes();
