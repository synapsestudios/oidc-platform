var config = require('../../config');
var knex = require('knex')({
  debug : process.env.DEBUG,
  client : 'pg',
  connection : config('/dbConnection')
});

module.exports = () => knex;
module.exports['@singleton'] = true;
