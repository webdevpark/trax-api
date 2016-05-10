"use strict"

/**
 * Integration tests for the reports module
 * @module test/job
 */

var hippie    = require('hippie'),
    chai      = require('chai'),
    fm        = require('fm-api-common'),
    expect    = chai.expect,
    assert    = chai.assert,
    dao       = require('../dao'),
    routes    = require('../routes'),
    tsys      = require('../lib/trax-sys'),
    jobHelper = require('../lib/job-helper'),
    server    = require('../server'),
    common    = require('./common'),
    Q         = require('q'),
    moment    = require('moment'),
    mongoose  = require('mongoose'),
    schemas   = require('../dao/jobs/schemas');

var ActivityBase = dao.jobs.models.ActivityBase,
    CustomerJob  = dao.jobs.models.CustomerJob,
    CustomerJobArchive = dao.jobs.models.archive.CustomerJob,
    JobType      = dao.jobs.common.models.JobType,
    api          = common.api,
    Message = dao.messaging.models.Message,
    messageTypes = dao.refs.messageTypes;

hippie.assert.showDiff = true;

describe("/messaging route", function(){
  describe("POST /msg", function(){
    it("should add a message", function(done){
      var request = require('./api-mocks/messaging/send-message-request-1');
      api(function(apiServer){
        return apiServer
          .post('/msg')
          .send(request)
          .expectStatus(201)
          .expect(function(res, body, next){
            Message.findOne({_id: body.id})
              .then(function(message){
                var assertions = [
                  hippie.assert(message.Expiry, "00:10:00", 'expiry'),
                  hippie.assert(message.JobId, request.JobId, "Job Id"),
                  hippie.assert(message.TypeOfMessage, request.MessageType, "message Type"),
                  hippie.assert(message.Subject, request.Subject, "subject"),
                  hippie.assert(message.Body, request.Body, "body"),
                  hippie.assert(message.Persistent, request.Persistent, "persistent"),
                  hippie.assert(Boolean(message.Sent), true, "who"),
                  hippie.assert(message.Recipient.EmailAddress, request.To, "recipient"),
                  hippie.assert(message.Sent.User.EmailAddress, "standard.user@firstmac.com.au", "From"),
                ];
                var invalid = false
                assertions.forEach(function(item){
                  if (item){
                    invalid = true;
                    next(item);
                  }
                });
                if (!invalid) {
                  next();
                }
              })
              .catch(function(e){console.log(e);next(e);});
          })
      }, done);
    });
  });

  describe('message updates/queries', function(){
    let messageId = null;
    let message2Id = null;
    let message3Id = null;
    let message4Id = null;

    before(function(done){

      let request = require('./api-mocks/messaging/send-message-request-1');
      let request2 = require('./api-mocks/messaging/send-message-request-2');
      var createMessage1 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer
            .post('/msg')
            .send(request)
            .expect(function(res, body, next){
              messageId = body.id;
              next(hippie.assert(Boolean(messageId), true, 'message was not created, message update tests depend on this to work' ))
            })
        }, function(){
          return resolve();
        });
      });

      var createMessage2 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer
            .post('/msg')
            .send(request2)
            .expect(function(res, body, next){
              message2Id = body.id;
              next(hippie.assert(Boolean(message2Id), true, 'message 2 was not created, message update tests depend on this to work' ))
            })
        }, function(){
          return resolve();
        });
      });

      var createMessage3 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer
            .post('/msg')
            .send(request2)
            .expect(function(res, body, next){
              message3Id = body.id;
              next(hippie.assert(Boolean(message3Id), true, 'message 3 was not created, message update tests depend on this to work' ))
            })
        }, function(){
          return resolve();
        });
      });

      var createMessage4 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer
            .post('/msg')
            .send(request2)
            .expect(function(res, body, next){
              message4Id = body.id;
              next(hippie.assert(Boolean(message4Id), true, 'message 4 was not created, message update tests depend on this to work' ))
            })
        }, function(){
          return resolve();
        });
      });

      var deliverMessage3 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer.put(`/msg/${message3Id}/deliver`)
        }, function(){
          return resolve();
        });
      });

      var acknowledgeMessage3 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer.put(`/msg/${message3Id}/ack`)
        }, function(){
          return resolve();
        });
      });

      var retractMessage3 = () => Q.Promise((resolve, reject, progress) => {
        api(function(apiServer){
          return apiServer.put(`/msg/${message3Id}/retract`)
        }, function(){
          return resolve();
        });
      });

      Q.all([createMessage1(), createMessage2(), createMessage3(), createMessage4()])
        .then(() => deliverMessage3())
        .then(() => acknowledgeMessage3())
        .then(() => retractMessage3())
        .then(function(){ done();})

    });

    describe('/PUT /msg/:id/deliver', function(){
      it('should set the delivered property when message is not delivered', function(done){
        api(function(apiServer){
          return apiServer
            .put(`/msg/${message2Id}/deliver`)
            .expectStatus(200)
            .expect(function(res, body, next){
              Message.findOne({_id:message2Id})
                .then(function(message){
                  next(hippie.assert(message.Delivered.User.EmailAddress, 'standard.user@firstmac.com.au', 'message deliverer' ));
                })
                .catch(e => console.log(e));
            })
        }, done);
      });

      it('should fail when message was sent to another user', function(done){
        api(function(apiServer){
          return apiServer
            .put(`/msg/${messageId}/deliver`)
            .expectStatus(500)
            .expect(function(res, body, next){
              Message.findOne({_id:messageId})
                .then(function(message){
                  next(hippie.assert(Boolean(message.Delivered), false, 'message deliverer' ));
                });
            })
        }, done);
      });

      it('should not update when message is delivered', function(done){

        Message.findOne({_id:message3Id})
          .then(function(beforeMessage){
            let when = beforeMessage.Delivered.When;
            api(function(apiServer){
              return apiServer
                .put(`/msg/${message3Id}/deliver`)
                .expectStatus(200)
                .expect(function(res, body, next){
                  Message.findOne({_id:message3Id})
                    .then(function(message){
                      next(hippie.assert(message.Delivered.When, when, 'message delivered date' ))
                    })
                })
            }, done);
          })

      });
    });

    describe('/PUT /msg/:id/retract', function(done){
      it('should set the retracted property when message is not acknowledged', function(done){
        api(function(apiServer){
          return apiServer
            .put(`/msg/${message2Id}/retract`)
            .expectStatus(200)
            .expect(function(res, body, next){
              Message.findOne({_id:message2Id})
                .then(function(message){
                  next(hippie.assert(message.Retracted.User.EmailAddress, 'standard.user@firstmac.com.au', 'message retracter' ));
                })
                .catch(e => console.log(e));
            })
        }, done);
      });

      it('should not update when message is retracted', function(done){

        Message.findOne({_id:message3Id})
          .then(function(beforeMessage){
            let when = beforeMessage.Retracted.When;
            api(function(apiServer){
              return apiServer
                .put(`/msg/${message3Id}/retract`)
                .expectStatus(200)
                .expect(function(res, body, next){
                  Message.findOne({_id:message3Id})
                    .then(function(message){
                      next(hippie.assert(message.Retracted.When, when, 'message retracted date' ))
                    })
                })
            }, done);
          })

      });
    });

    describe('/PUT /msg/:id/acknowledge', function(done){
      it('should set the acknowledged property when message is not acknowledged', function(done){
        api(function(apiServer){
          return apiServer
            .put(`/msg/${message2Id}/ack`)
            .expectStatus(200)
            .expect(function(res, body, next){
              Message.findOne({_id:message2Id})
                .then(function(message){
                  next(hippie.assert(message.Acknowledged.User.EmailAddress, 'standard.user@firstmac.com.au', 'message acknowledger' ));
                })
                .catch(e => console.log(e));
            })
        }, done);
      });

      it('should fail when message was sent to another user', function(done){
        api(function(apiServer){
          return apiServer
            .put(`/msg/${messageId}/ack`)
            .expectStatus(500)
            .expect(function(res, body, next){
              Message.findOne({_id:messageId})
                .then(function(message){
                  next(hippie.assert(Boolean(message.Acknowledge), false, 'message acknowledger' ));
                });
            })
        }, done);
      });

      it('should not update when message is acknowledged', function(done){

        Message.findOne({_id:message3Id})
          .then(function(beforeMessage){
            let when = beforeMessage.Acknowledged.When;
            api(function(apiServer){
              return apiServer
                .put(`/msg/${message3Id}/ack`)
                .expectStatus(200)
                .expect(function(res, body, next){
                  Message.findOne({_id:message3Id})
                    .then(function(message){
                      next(hippie.assert(message.Acknowledged.When, when, 'message acknowledged date' ))
                    })
                    .catch(function(e){console.log(e);})
                })
            }, done);
          })

      });
    });
    describe('queries', function(){
      describe('retrieve', function(){
        it('should return a message', function(done){
          api(function(apiServer){
            return apiServer
              .get(`/msg/${messageId}`)
              .expectStatus(200)
              .expect(function(res, body, next){
                next(hippie.assert(body._id, messageId, 'message id'));
              });
          }, done);
        })
      });

      describe('retrieve my', function(){
        it('should return a result', function(done){
          api(function(apiServer){
            return apiServer
              .get(`/msg/my`)
              .expectStatus(200)
              .expect(function(res, body, next){
                next(hippie.assert(body.length > 0, true, 'messages length'));
              });
          }, done);
        })
      });

      describe('retrieve active', function(){
        it('should return a result', function(done){
          api(function(apiServer){
            return apiServer
              .get(`/msg/active`)
              .expectStatus(200)
              .expect(function(res, body, next){
                next(hippie.assert(body.length > 0, true, 'messages length'));
              });
          }, done);
        })
      });
    })
  });
});
