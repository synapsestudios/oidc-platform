var Glue   = require('glue');
var manifest = require('./manifest');

var options = {
  relativeTo: __dirname + '/src'
};

Glue.compose(manifest, options, function(err, server) {

  if (err) {
    throw err;
  }

  server.start(function () {
    console.log('Server running at:', server.info.uri);
  });
});
