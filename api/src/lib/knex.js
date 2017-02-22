var config = require('../../config');
var knex = require('knex')({
  debug : process.env.DEBUG,
  client : config('/dbAdapter'),
  connection : config('/dbConnection')
});

module.exports = () => knex;
module.exports['@singleton'] = true;
