var Glue   = require('glue');
var manifestPromise = require('./manifest');

var options = {
  relativeTo: __dirname + '/src'
};

manifestPromise.then(manifest => {
  Glue.compose(manifest, options, function(err, server) {
    if (err) {
      throw err;
    }

    server.start(function () {
      console.log('Server running at:', server.info.uri);
    });
  });
});
