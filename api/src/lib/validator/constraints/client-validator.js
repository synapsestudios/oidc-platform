const Boom = require('boom');

module.exports = server => async (value, options) => {
  const provider = server.plugins['open-id-connect'].provider;

  const client = await provider.Client.find(value);
  if (!client) throw Boom.notFound('Client not found');

  const redirectUri = options.context.values.redirect_uri;
  if (client.redirectUris.indexOf(redirectUri) < 0) throw Boom.forbidden('redirect_uri not in whitelist');

  return value;
}


// module.exports = (bookshelf, ValidationError) => {
//   return (modelName, column, message) => {
//     return (value) => {
//       return new Promise((resolve, reject) => {
//         var Model = bookshelf.model(modelName);
//         var where = {};

//         where[column] = value;

//         var query = Model.where(where);

//         query.fetch()
//           .then(model => {
//             if (! model) {
//               reject(new ValidationError(message || 'Row does not exist', 'rowExist'));
//             } else {
//               resolve(value);
//             }
//           }
//         ).catch((err) => {
//           reject(err);
//         });
//       });
//     };
//   };
// };

module.exports['@singleton'] = true;
module.exports['@require'] = ['server'];

