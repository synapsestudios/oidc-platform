module.exports = (server) => (template, context, options) => {
  context = context || {};
  options = options || {};
  return new Promise((resolve, reject) => {
    server.render(template, context, options, (err, rendered) => {
      if (err) {
        reject(err);
      } else {
        resolve(rendered);
      }
    });
  }).catch(err => {
    console.log(err);
    server.methods.reportError(err);
  });
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['server'];
