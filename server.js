
var tsys    = require('./lib/trax-sys'),
    routes  = require('./routes'),
    fm      = require('fm-api-common')

fm.server.put('/job/:id/hold',              tsys.auth, tsys.action(routes.job.hold, { triggerPoint: 'hold' }));
fm.server.put('/job/:id/off-hold',          tsys.auth, tsys.action(routes.job.offHold, { triggerPoint: 'offhold' }));
fm.server.put('/job/:id/reassign',          tsys.auth, tsys.action(routes.job.reassign, { triggerPoint: 'reassign' }));
fm.server.put('/job/:id/close',             tsys.auth, tsys.action(routes.job.close, { triggerPoint: 'close' }));
fm.server.put('/job/:id/complete',          tsys.auth, tsys.action(routes.job.complete, { triggerPoint: 'complete' }));
fm.server.put('/job/:id/resurrect',         tsys.auth, tsys.action(routes.job.resurrect, { triggerPoint: 'resurrect' }));
fm.server.put('/job/:id/idents',            tsys.auth, tsys.action(routes.job.idents, { triggerPoint: 'change-idents' }));
fm.server.del('/job/:id/chain',             tsys.auth, tsys.action(routes.job.unchain, { triggerPoint: 'unchain' }));
fm.server.post('/job/:id/chain',            tsys.auth, tsys.action(routes.job.chain, { triggerPoint: 'chain' }));
fm.server.get('/job/:id/chains',            tsys.auth, tsys.action(routes.job.chains, { triggerPoint: null }));
fm.server.put('/job/hold-others',           tsys.auth, tsys.action(routes.job.holdOthers, { triggerPoint: null }));
fm.server.put('/job/:id/type',              tsys.auth, tsys.action(routes.job.changeType, {triggerPoint: null}));
fm.server.put('/job/:id/attachment',        tsys.auth, tsys.action(routes.job.attachment, {triggerPoint: null}));
fm.server.del('/job/:id/attachment/:aid',   tsys.auth, tsys.action(routes.job.removeAttachment, {triggerPoint: null}));
fm.server.post('/job',                      tsys.auth, tsys.action(routes.job.create, { triggerPoint: 'create' }));
fm.server.get('/job/:id',                   tsys.auth, tsys.action(routes.job.retrieve, { triggerPoint: null }));
fm.server.put('/job/:id',                   tsys.auth, tsys.action(routes.job.update, { triggerPoint: 'update' }));
fm.server.put('/job/:id/approve-gate',      tsys.auth, tsys.action(routes.gate.approve, { triggerPoint: 'approve' }));
fm.server.put('/job/:id/suspend-gate',      tsys.auth, tsys.action(routes.gate.suspend, { triggerPoint: 'suspend' }));
fm.server.put('/job/:id/decline-gate',      tsys.auth, tsys.action(routes.gate.decline, { triggerPoint: 'decline' }));
fm.server.put('/job/:id/unsuspend-gate',    tsys.auth, tsys.action(routes.gate.unsuspend, { triggerPoint: 'unsuspend' }));
fm.server.get('/job/:id/attachments',       tsys.auth, tsys.action(routes.job.listAttachments, {triggerPoint: null}));
fm.server.get('/job/:id/children',          tsys.auth, tsys.action(routes.job.children, {triggerPoint: null}));
fm.server.get('/job/:id/related',           tsys.auth, tsys.action(routes.job.related, {triggerPoint: null}));

fm.server.get('/push/unfinished',           tsys.auth, tsys.action(routes.push.unfinishedAssignments, { triggerPoint: null }));
fm.server.post('/push/next',                tsys.auth, tsys.action(routes.push.assignNextAvailable.bind(routes.push), { triggerPoint: null }));

fm.server.get('/type/break',                tsys.auth, tsys.action(routes.type.breakTypes, { triggerPoint: null }));

fm.server.get('/report/by-identity/:idt/:id',               tsys.auth, tsys.action(routes.report.byIdentity, {triggerPoint: null}));
fm.server.get('/report/job-exists-for-id/:idt/:id',         tsys.auth, tsys.action(routes.report.jobExistsForIdentity, {triggerPoint:null}));
fm.server.get('/report/closure-count-by-user/:start/:end',  tsys.auth, tsys.action(routes.report.closureCountByUser, {triggerPoint:null}));
fm.server.get('/report/closures',                           tsys.auth, tsys.action(routes.report.closures, {triggerPoint:null}));
fm.server.get('/report/by-user/:ps/:p',                     tsys.auth, tsys.action(routes.report.byUser, {triggerPoint:null}))
fm.server.post('/special/refund-request',                   tsys.auth, tsys.action(routes.special.refundRequest, {triggerPoint:null}));
fm.server.post('/special/funds-register',                   tsys.auth, tsys.action(routes.special.fundsRegister, {triggerPoint:null}));
fm.server.post('/special/purchase-order',                   tsys.auth, tsys.action(routes.special.purchaseOrder, {triggerPoint:null}));
fm.server.post('/special/expense-claim',                    tsys.auth, tsys.action(routes.special.expenseClaim, {triggerPoint:null}));
fm.server.post('/special/fits',                             tsys.auth, tsys.action(routes.special.fits, {triggerPoint:null}));

fm.server.get('/event/logged-in', tsys.auth, tsys.action(routes.tracking.loggedIn, {triggerPoint:null}));
fm.server.get('/event/latest',    tsys.auth, tsys.action(routes.tracking.latest, {triggerPoint:null}));
fm.server.post('/event',          tsys.auth, tsys.action(routes.tracking.add, {triggerPoint:null}));

fm.server.post('/msg',                tsys.auth, tsys.action(routes.messaging.sendMessage, {triggerPoint:null}));
fm.server.put('/msg/:id/deliver',     tsys.auth, tsys.action(routes.messaging.deliver, {triggerPoint:null}));
fm.server.put('/msg/:id/ack',         tsys.auth, tsys.action(routes.messaging.acknowledge, {triggerPoint:null}));
fm.server.put('/msg/:id/retract',     tsys.auth, tsys.action(routes.messaging.retract, {triggerPoint:null}));
fm.server.get('/msg/active',          tsys.auth, tsys.action(routes.messaging.retrieveActive, {triggerPoint:null}));
fm.server.get('/msg/my',              tsys.auth, tsys.action(routes.messaging.retrieveMy, {triggerPoint:null}));
fm.server.get('/msg/:id',             tsys.auth, tsys.action(routes.messaging.retrieve, {triggerPoint:null}));

fm.server.post('/job/:id/comment',    tsys.auth, tsys.action(routes.comment.add, {triggerPoint: null}));
fm.server.del('/job/comment/:id',     tsys.auth, tsys.action(routes.comment.delete, {triggerPoint: null}));
fm.server.get('/job/:id/comments',    tsys.auth, tsys.action(routes.comment.retrieveForJob, {triggerPoint: null}));

fm.server.get('/trigger/format/:trigger/:id', tsys.auth, tsys.action(routes.trigger.formatPoppableUrls, {triggerPoint: null}));
fm.server.post('/trigger/:trigger/:id',       tsys.auth, tsys.action(routes.trigger.execute, {triggerPoint: null}));

fm.server.get('/recurring',     tsys.auth, tsys.action(routes.recurring.list, {triggerPoint: null}));
fm.server.get('/recurring/:id', tsys.auth, tsys.action(routes.recurring.retrieve, {triggerPoint: null}));
fm.server.post('/recurring/',   tsys.auth, tsys.action(routes.recurring.upsert, {triggerPoint: null}));
fm.server.del('/recurring/:id', tsys.auth, tsys.action(routes.recurring.delete, {triggerPoint: null}));
