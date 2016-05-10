
var fm      = require('fm-api-common'),
    routes  = require('./routes'),
    tsys    = require('./lib/trax-sys'),
    server  = require('./server'),
    config  = require('config');

fm.logger.info(config);

// start the server listening now
fm.server.listen(3000, function () {
  fm.logger.info('%s listening at %s', fm.server.name, fm.server.url);
});
