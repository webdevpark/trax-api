"use strict";

/**
 * Automated job delivery module
 * @module routes/push
 */

var fm        = require('fm-api-common'),
    logger    = fm.logger,
    Q         = require('q'),
    _         = require('lodash'),
    mongoose  = require('mongoose'),
    restify   = require('restify'),
    dao       = require('../dao'),
    moment    = require('moment-timezone'),
    config    = require('config'),
    ObjectId  = mongoose.Types.ObjectId;

var jobHelper    = require('../lib/job-helper'),
    chainHelper  = require('../lib/chain-helper'),
    TraxClient   = require('../lib/client').TraxClient

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob;

/**
 * Static module to hold all push routes
 * @class JobRoutes
 */
var PushRoutes = function () {
  var self = this;
};
//
// case "QLD": return "E. Australia Standard Time";
// case "NSW": return "AUS Eastern Standard Time";
// case "ACT": return "AUS Eastern Standard Time";
// case "VIC": return "AUS Eastern Standard Time";
// case "NT": return "AUS Central Standard Time";
// case "SA": return "Cen. Australia Standard Time";
// case "TAS": return "Tasmania Standard Time";
// case "WA": return "W. Australia Standard Time";
// default: return "E. Australia Standard Time";

function convertWindowsTimezoneIdentifierToIANA(timeZoneId){
  switch (timeZoneId) {
    case "E. Australia Standard Time"     : return "Australia/Brisbane";
    case "AUS Eastern Standard Time"      : return "Australia/Sydney";
    case "Cen. Australia Standard Time"   : return "Australia/Adelaide";
    case "Tasmania Standard Time"         : return "Australia/Hobart";
    case "W. Australia Standard Time"     : return "Australia/Perth";
    default                               : return "Australia/Sydney";
  }
}

function getTimeInJobTimezone(job) {
  let timezoneId = null;
  if (job && job.Partitioning && job.Partitioning.TimeZone && job.Partitioning.TimeZone.length > 0) {
    timezoneId = job.Partitioning.TimeZone[0];
  }
  if (!timezoneId) {
    return null;
  }
  return moment().tz(convertWindowsTimezoneIdentifierToIANA(timezoneId))
}

function isWithinBusinessHours(job) {
  let jobTime = getTimeInJobTimezone(job);
  if (!jobTime) {
    return true; //only check business hours if job has a timezone partition.
  }
  let businessHours = config.get('business-hours');
  let startDay = moment(jobTime).startOf('day');
  let startBusinessDay = moment(startDay);
  let endBusinessDay = moment(startDay);

  startBusinessDay.add(moment.duration(businessHours.start));
  endBusinessDay.add(moment.duration(businessHours.end));

  return (jobTime.isSameOrAfter(startBusinessDay) && jobTime.isSameOrBefore(endBusinessDay));
}
/**
 * Retrieves unfinished assignments
 * @func unfinishedAssignments
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
PushRoutes.prototype.unfinishedAssignments = function (req, res, next) {

  /* we're looking for jobs that are incomplete, not on hold and are currently assigned to
     the user requesting this api */
  let query = {
    "Completed": null,
    "Closed": null,
    "OnHold": null,
    "Assigned.Who.EmailAddress": jobHelper.makeUser(req.user).EmailAddress
  };

  // kick the search off now
  return ActivityBase.find(query)
    .then(jobs => {
      var withinBusinessHours = _.filter(jobs, job => isWithinBusinessHours(job));

      /* if the query was unable to locate a suitable job, we'll call it in
         as a 404. This will prompt the client to look elsewhere for a job */
      if (withinBusinessHours.length == 0) {
        return next(new restify.NotFoundError(`No candidate job was found`));
      }
      let job = withinBusinessHours[0];
      // send the located file back down the pipe
      res.send(job);
      return next();

    })
    .catch(next)
    .done();
}

function retrieveUnfinishedOrOverdueHeldAssignment (user) {

  let isIgnoringAssigned = false;
  return dao.ctrl.User.findOne({where:{emailAddress:user.EmailAddress}})
    .then(acUser => {
      // // create an activity control reference
      // Ac.Entities entities = new Ac.Entities();
      //
      // bool isIgnoringAssigned = false;
      //
      // if (user.IgnoreAssignedUntil != null && user.IgnoreAssignedUntil >= DateTime.Now)
      // {
      //     isIgnoringAssigned = true;
      // }
      //
      if (!acUser) {
        throw new restify.InternalError(`user could not be find in activity control with email address ${user.EmailAddress}`);
      }
      if (acUser.ignoreAssignedUntil && acUser.ignoreAssignedUntil >= new Date()) {
        isIgnoringAssigned = true;
        return dao.ctrl.JobType.find({where:{neverIgnore: true}});
      }
      return null;
    })
    .then(neverIgnoreJobTypeIds => {
      // // not completed, not closed, on hold and assigned to the user
      // var query = Query.And(
      //     Query.EQ("Completed", BsonNull.Value),
      //     Query.EQ("Closed", BsonNull.Value),
      //     Query.EQ("Assigned.Who.TontoUserId", user.TontoUserID.Value),
      //     Query.Or(
      //         Query.And(
      //             Query.NE("OnHold", BsonNull.Value),
      //             Query.LT("FollowUp.When", BsonDateTime.Create(DateTime.UtcNow))
      //         ),
      //         Query.EQ("OnHold", BsonNull.Value)
      //     )
      // );
      let query = {
        "Completed": null,
        "Closed": null,
        "Assigned.Who.EmailAddress": user.EmailAddress,
        "$or":[
          {
              "OnHold":{"$ne":null},
              "FollowUp.When":{"$lt":moment.utc().toDate()}
          },
          { "OnHold":null}
        ]
      }
      if (isIgnoringAssigned){
        // if (isIgnoringAssigned)
        // {
        //     var jobsThatCanNeverBeIgnored = entities.JobTypes.Where(jt => jt.NeverIgnore == true).ToList();
        //     var jobIds = jobsThatCanNeverBeIgnored.Select(jt => new BsonInt32(jt.ID)).ToList();
        //
        //     //rules for paused users don't assign any jobs unless:
        //     var filter = Query.Or(                                                                              // either:
        //         Query.EQ("Assigned", BsonNull.Value),                                                           // the job is not assigned (pause only affects jobs in the users queue)
        //         Query.Or(                                                                                       // or else either (following rules for assigned jobs)
        //             Query.In("JobType.JobTypeId", jobIds),                                                      //  the job type is never ignored, or
        //             Query.EQ("OnHold", BsonNull.Value),                                                         //  the job is currently being worked on, or
        //             Query.EQ("FollowUp.When", BsonDateTime.Create(DateTime.MinValue.ToUniversalTime()))         //  the job was previously interrupted
        //         )
        //     );
        //     query = Query.And(query, filter);
        // }
        query = {"$and":[
          query,
          {"$or": [
            {"Assigned": null},                                         // the job is not assigned (pause only affects jobs in the user's queue)
            {"$or":[                                                    // or else either (following rules for assigned jobs)
              {"JobType.JobTypeId": {"$in": neverIgnoreJobTypeIds}},    //  the job type is never ignored, or
              {"OnHold": null},                                         //  the job is currently being worked on, or
              {"FollowUp.When": Date.UTC(1,1,1)}                        //  the job was previously interrupted
            ]}
          ]}
        ]}
      }

      //
      // var sorter = SortBy
      //     .Ascending("IsOnHold") //Assignments Not on hold (OnHold == null) should push first, then all of the on hold assignments should have the same sort order (because the on hold jobs will be on hold to the same user). The followup.when sort clause will apply later to further sort on hold jobs.
      //     .Descending("Priority")
      //     .Ascending("FollowUp.When")
      //     .Ascending("Created.When");
      let sorter = {
        "IsOnHold": 1,
        "Priority": -1,
        "FollowUp.When": 1,
        "Created.When": 1
      }
      //
      // var matchClause = new BsonDocument("$match", query.ToBsonDocument());
      // var sortClause= new BsonDocument("$sort", sorter.ToBsonDocument());
      // //need to add a computed field "IsOnHold" that we can sort on to determine whether the job is being worked on currently or not.
      //
      // var fieldsToReturn =
      //         @"OnHold:1,
      //         Priority:1,
      //         FollowUp:1,
      //         Created:1,
      //         Partitioning:1,
      //         Identities:1,
      //         Assigned:1";
      //
      // var preSortProjectionClause = BsonDocument.Parse(
      //     @"{$project:{
      //         IsOnHold:{ $cond: [ {$eq:[""$OnHold"", null]}, false, true] }," +
      //         fieldsToReturn +
      //     "}}"
      //     );
      //
      // //remove the extra field so it will deserialise to a customerjob
      // var postSortProjectionClause = BsonDocument.Parse(
      //     @"{$project:{" +
      //         fieldsToReturn +
      //     "}}"
      //     );
      //
      // var results = store.Collection.Aggregate(
      //     matchClause,
      //     preSortProjectionClause,
      //     sortClause,
      //     postSortProjectionClause
      //     );
      //
      return ActivityBase.aggregate(
        {$match: query},
        {$project:
          {
            "IsOnHold":{ $cond: [ {$eq:["$OnHold", null]}, false, true] },
            "OnHold":1,
            "Priority":1,
            "FollowUp":1,
            "Created":1,
            "Partitioning":1,
            "Identities":1,
            "Assigned":1
          }
        },
        {$sort: sorter},
        {$project:
          {
            "OnHold":1,
            "Priority":1,
            "FollowUp":1,
            "Created":1,
            "Partitioning":1,
            "Identities":1,
            "Assigned":1
          }
        }
      ).exec();
    })
    .then(jobs => {
      // //filter by timezone
      // var jobToPush = jobs.Where(j => j.IsWithinBusinessHours()).FirstOrDefault(); //this will return true for all jobs except those that have timezone partitions and the time in the timezone is outside the configured business hours.
      // // return the assignment serial
      // return jobToPush != null ? jobToPush._id : null;
      var withinBusinessHours = _.filter(jobs, job => isWithinBusinessHours(job));

      if (withinBusinessHours.length == 0) {
        return null;
      }
      let job = withinBusinessHours[0];
      // send the located file back down the pipe
      return job;
    });
}

PushRoutes.prototype.retrieveUserJobTypePriorities = function(emailAddress){
  return dao.ctrl.sequelize.query(
    'Select * from "JobTypeUser" where "EmailAddress" =:emailAddress',
    {
      replacements: {emailAddress: emailAddress},
      type:dao.ctrl.sequelize.QueryTypes.SELECT
    })
    .then(results => _.map(results, result => ({
      JobTypeID: result.JobTypeID,
      Priority: result.Priority,
      Attribute: result.Attribute,
      Value: result.Value,
      FilterOperatorName: result.FilterOperatorName
    })));
}

/**
 * Assigns the next available job for this user
 * @func unfinishedAssignments
 * @param req Object The incoming request
 * @param res Object The outgoing response
 */
PushRoutes.prototype.assignNextAvailable = function (req, res, next) {
  let user = jobHelper.makeUser(req.user);
  let self = this;
  // // check if the user has an overdue assignment
  // string overdueAssignment = RetrieveUnfinishedOrOverdueHeldAssignment(user);
  return retrieveUnfinishedOrOverdueHeldAssignment(user)
    .then(unfinishedOrOverdueJob => {
      //
      // //// get out here if have an overdue assignment
      // if (!String.IsNullOrEmpty(overdueAssignment))
      // {
      //     return overdueAssignment;
      // }
      if (unfinishedOrOverdueJob) {

        return unfinishedOrOverdueJob;
      }
      //             // get the job types that this user is allowed to do
      //             List<Ac.JobTypeUser> jobTypesUser = entities.JobTypeUsers.Where(jtu => jtu.UserID == user.ID).ToList();
      //
      return self.retrieveUserJobTypePriorities(user.EmailAddress)
        .then(jtus => {
          //             // get a distinct, ordered list of priorities
          //             List<int?> priorities = jobTypesUser.Where(jtu => (!jtu.Priority.HasValue) || jtu.Priority < 1000000).Select(jtu => jtu.Priority).OrderBy(p => p.HasValue ? p.Value : Int32.MaxValue).Distinct().ToList();
          //
          let priorities = _(jtus)
            .filter(jtu => !jtu.Priority || jtu.Priority < 1000000)
            .map(jtu => jtu.Priority)
            .sortBy(p => p ? p : Number.MAX_VALUE)
            .uniq()
            .value();

          let searchAssignmentPromise = Q();
            //             foreach (var sourcePriority in priorities) {
            //
            //                 Func<bool, string> searchForAssignment = new Func<bool, string>((bool focusEscalations) => {

          priorities.forEach(sourcePriority => {
            searchAssignmentPromise = searchAssignmentPromise.then(successfulAssignment => {

              if (successfulAssignment) {
                return successfulAssignment; //pass through
              }
              let searchForAssignment = function(focusEscalations) {
                //                                    var jobTypes = from jtu in jobTypesUser
                //                                    where jtu.Priority == sourcePriority
                //                                    select jtu;
                //
                //                     List<IMongoQuery> priorityCriteria = new List<IMongoQuery>();
                //                     List<IMongoQuery> criteria = new List<IMongoQuery>();

                let jobTypes = _.filter(jtus, jtu => jtu.Priority == sourcePriority);

                let assignment = null;

                //                     // setup the basic criteria for the query
                //                     criteria.Add(Query.EQ("Armed", BsonBoolean.Create(true)));
                //                     criteria.Add(Query.EQ("Completed", BsonNull.Value));
                //                     criteria.Add(Query.EQ("Closed", BsonNull.Value));
                //                     criteria.Add(Query.EQ("Assigned", BsonNull.Value));
                //
                //                     // add priority testing
                //                     criteria.Add(focusEscalations ? Query.NE("Priority", BsonNull.Value) : Query.EQ("Priority", BsonNull.Value));
                //
                let criteria = [
                  //{"Armed": true},
                  {"Completed": null},
                  {"Closed": null},
                  {"Assigned": null},
                  {"Priority": focusEscalations ? {"$ne": null} : null},
                  /* need to be mindful of follow-up dates here as jobs that have a future follow-up
                  //                      * should be invisible to the auto system */
                  //                     criteria.Add(
                  //                         Query.Or(
                  //                             Query.EQ("FollowUp", BsonNull.Value),
                  //                             Query.LT("FollowUp.When", BsonDateTime.Create(DateTime.UtcNow))
                  //                         )
                  //                     );
                  {"$or":[
                    {"FollowUp": null},
                    {"FollowUp.When": {"$lt": moment.utc().toDate()}}
                  ]}
                ];

                let jobCriteria = [];
                let priorityCriteria = [];
                //                     foreach (var jobTypeId in jobTypes.Select(jt => jt.JobTypeID).Distinct()) {
                //                         foreach (var jobType in jobTypes.Where(jt => jt.JobTypeID == jobTypeId)) {
                _(jobTypes)
                  .map(jtu => jtu.JobTypeID)
                  .uniq()
                  .value()
                  .forEach(jtId => {
                    let querySets = {};
                    _.filter(jobTypes, jtu => jtu.JobTypeID == jtId)
                    .forEach(jobType => {
                      // determine if any filter is required here
                      //                             if (jobType.FilterOperatorName != null && jobType.Attribute != null) {
                      //                                 List<IMongoQuery> current = null;
                      //                                 var key = jobType.JobTypeID.ToString() + "_" + jobType.Attribute;
                      //                                 if (!querySets.ContainsKey(key)) {
                      //                                     querySets[key] = new List<IMongoQuery>();
                      //                                 }
                      //
                      //                                 current = querySets[key];
                      //
                      //                                 // build the bson attribute value
                      //                                 BsonValue attributeValue = BsonNull.Value;
                      //
                      //                                 if (jobType.Attribute != null)
                      //                                     attributeValue = new BsonString(jobType.Value);
                      //
                      //                                 if (jobType.FilterOperatorName == "Equal To") {
                      //                                     current.Add(Query.EQ("Partitioning." + jobType.Attribute, attributeValue));
                      //                                 } else if (jobType.FilterOperatorName == "Not Equal To") {
                      //                                     current.Add(Query.NE("Partitioning." + jobType.Attribute, attributeValue));
                      //                                 } else if (jobType.FilterOperatorName == "Contains") {
                      //                                     current.Add(Query.Matches("Partitioning." + jobType.Attribute, new BsonRegularExpression(jobType.Value)));
                      //                                 }
                      //
                      //                             }
                      if (jobType.FilterOperatorName && jobType.Attribute) {

                        let key = jobType.JobTypeID.toString() + '_' + jobType.Attribute;
                        if (!querySets[key]) {
                          querySets[key] = [];
                        }
                        let current = querySets[key];
                        let attributeValue = jobType.Value;
                        let partitionClause = {};
                        let propName = "Partitioning." + jobType.Attribute;

                        if (jobType.FilterOperatorName == "Equal To") {
                          partitionClause[propName] = attributeValue;
                        } else if (jobType.FilterOperatorName == "Not Equal To") {
                          partitionClause[propName] = {"$ne": attributeValue};
                        } else if (jobType.FilterOperatorName == "Contains") {
                          partitionClause[propName] = new RegExp(attributeValue);
                        }

                        current.push(partitionClause);
                      }
                    });
                    //                         var orQueries = from k in querySets.Keys
                    //                                         where querySets[k].Count > 0
                    //                                         select Query.Or(querySets[k].ToArray());
                    //

                    let orQueries = _(Object.keys(querySets))
                      .map(k => querySets[k])
                      .filter(v => v.length > 0)
                      .map(v => ({"$or": v}))
                      .value();
                    //                         if (orQueries.Count() > 0) {
                    //                             jobCriteria.Add(
                    //                                 Query.And(
                    //                                     orQueries.Concat(new IMongoQuery[] { Query.EQ("JobType.JobTypeId", new BsonInt32(jobTypeId)) }).ToArray()
                    //                                 )
                    //                             );
                    //                         } else {
                    //                             jobCriteria.Add(Query.EQ("JobType.JobTypeId", new BsonInt32(jobTypeId)));
                    //                         }
                    if (orQueries.length > 0) {
                      orQueries.push({"JobType.JobTypeId": jtId});
                      jobCriteria.push({"$and": orQueries});
                    } else {
                      jobCriteria.push({"JobType.JobTypeId": jtId});
                    }



                  })
                  //
                  //                     if (jobCriteria.Count > 0) {
                  //                         criteria.Add(Query.Or(jobCriteria.ToArray()));
                  //                     }
                  //
                  //                     var query = Query.And(criteria.ToArray());
                  //                     var sorter = focusEscalations ? SortBy.Descending("Priority").Ascending("FollowUp.When").Ascending("Created.When") : SortBy.Ascending("FollowUp.When").Ascending("Created.When");
                  //
                if (jobCriteria.length > 0) {
                  criteria.push({"$or": jobCriteria});
                }
                let query = {"$and": criteria};
                let sorter = focusEscalations ? "-Priority FollowUp.When Created.When" : "FollowUp.When Created.When";
                  // {
                  //   "Priority": -1,
                  //   "FollowUp.When": 1,
                  //   "Created.When": 1
                  // }
                  // :
                  // {
                  //   "FollowUp.When": 1,
                  //   "Created.When": 1
                  // };

                //                     var candidates = store.Collection.Find(query).SetSortOrder(sorter);
                //
                //                     var atomicallyAllocate = new Func<CustomerJob, Ac.User, UpdateBuilder, bool>((cj, usr, upd) => {
                //
                //                         int? lockId = null;
                //
                //                         try {
                //                             // TODO: try to lock the record
                //                             lockId = LockJob(cj._id, usr);
                //
                //                             if (lockId.HasValue) {
                //                                 // refresh this job record, just to make sure that it's still unassigned
                //                                 var refreshedJob = store.Collection.FindOneById(new ObjectId(cj._id));
                //
                //                                 if (refreshedJob.Assigned == null) {
                //                                     // perform the update which will allocate to the user
                //                                     var res = store.Collection.Update(Query.EQ("_id", new ObjectId(cj._id)), update);
                //                                     if (res != null && res.Ok) {
                //                                         return true;
                //                                     }
                //                                 }
                //                             }
                //
                //                         } catch (Exception e) {
                //
                //                         } finally {
                //                             if (lockId.HasValue) {
                //                                 UnlockJob(lockId.Value);
                //                             }
                //                         }
                //
                //                         return false;
                //
                //                     });
                return ActivityBase.find(query).sort(sorter)
                  .then(candidates => {
                    let atomicallyAllocate = jobToAllocate => {
                      let lockId = null
                      return dao.ctrl.User.findOne({emailAddress: user.EmailAddress})
                        .then(acUser => {
                          lockId = lockJob(jobToAllocate, acUser.iD);
                          if (lockId){
                            return ActivityBase.findOne({_id:jobToAllocate._id})
                            .then(refreshedJob => {
                              if (!refreshedJob.Assigned) {
                                refreshedJob.Assigned = jobHelper.makeMovement(req.user);
                                return refreshedJob.save();
                              }
                              return null;
                            })
                            .finally(() => {
                              if (lockId) {
                                return unlockJob(lockId);
                              }
                              return;
                            })
                          }
                          return null;
                        })
                    };
                  //
                  //                     var jobToAssign = candidates.FirstOrDefault();
                  //                     if (jobToAssign != null)
                  //                     {
                  //                         //we have found the job that should be assigned. try to assign it. If not able, there might be a lock on the job, or some error occurred. Either way,
                  //                         //don't try to assign a different job.
                  //                         assignment = jobToAssign._id;
                  //                         string assigneeEmailAddress = null;
                  //                         var allocated = atomicallyAllocate(jobToAssign, user, update);
                  //                         if (allocated)
                  //                         {
                  //                             assigneeEmailAddress = user.EmailAddress;
                  //
                  //                             // perform any chaining required for this job
                  //                             var reason = "reassigning chained jobs after auto assign";
                  //                             var to = GetUserByEmailAddress(assigneeEmailAddress);
                  //                             ChainReaction(assignment, null, new Action<CustomerJob>((CustomerJob j) => ReassignJob(j._id, to, reason, null, null, null, false)));
                  //
                  //                         }
                  //                         return assignment;
                  //                     }
                    if (candidates && candidates.length > 0) {
                      let jobToAssign = candidates[0];
                      let assignment = jobToAssign._id;
                      let assigneeEmailAddress = null;
                      return atomicallyAllocate(jobToAssign)
                        .then(allocatedJob => {
                          if (allocatedJob){
                            assigneeEmailAddress = user.EmailAddress;
                            let reason = "reassigning chained jobs after auto assign";

                            var client = new TraxClient({ token: req.headers.authorization });
                            return chainHelper.chainReaction(allocatedJob._id, null, j => client.reassign(j._id, {
                                To: assigneeEmailAddress,
                                Reason: reason
                              }))
                              .then(() => allocatedJob);
                          }
                          return allocatedJob;
                        })
                    }
                    return null;
                });
              }

              //                 });
              //
              //                 // try to find one with priority
              //                 var selectedAssignment = searchForAssignment(true);
              //
              //                 // if we didn't find an escalated job
              //                 if (String.IsNullOrEmpty(selectedAssignment)) {
              //
              //                     // try to find one with a normal priority
              //                     selectedAssignment = searchForAssignment(false);
              //
              //                 }
              //
              //                 // if we did find one, sent it out
              //                 if (!String.IsNullOrEmpty(selectedAssignment)) {
              //                     return selectedAssignment;
              //                 }
              return searchForAssignment(true)
                .then(selectedAssignment => {
                  if (!selectedAssignment) {
                    return searchForAssignment(false);
                  }
                  return selectedAssignment;
                })

              })

            })

          //we have set up a promise chain that will execute a series of searches in priority order.
          //once complete, it will return a successful assignment, or nothing
          // in the case of a successful assignment, we will write the assignment as a job movement.
          return searchAssignmentPromise
            .then(successfulAssignment => {
              if (successfulAssignment && successfulAssignment._id) {
                return jobHelper.writeMovement(successfulAssignment._id, 'user-assignment', {
                  Who: {
                    EmailAddress: String.Empty,
                    Name:"Job System",
                    TontoUserId: null
                  },
                  To: user
                }, "Auto-assigned by job service", null)
                .then(() => successfulAssignment);

              } else {
                return null;
              }
          })
        });
    })

  .then(assignment => {
    if (assignment) {
      res.send(200, {_id: assignment._id});
    } else {
      res.send(404);
    }
    return next();

  })
  .catch(next)
  .done();
}

function lockJob(jobId, userId) {
  return dao.ctrl.JobLock.findOne({serial: jobId})
    .then(l => {
      if (l) {
        return null;
      }
      return dao.ctrl.JobLock
        .build({
          acquired: Date.now(),
          serial: jobId,
          userID: userId
        })
        .save()
        .then(savedLock => {
          return savedLock.iD
        });
    })
    .catch(err => null);
}

function unlockJob (lockId) {
  return dao.ctrl.JobLock
    .findOne({iD: lockId})
    .then(lock => {
      if (!lock) {
        return;
      }
      return lock.destroy();
    })
}

module.exports = new PushRoutes();
