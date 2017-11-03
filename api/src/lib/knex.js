var config = require('../../config');
var knex = require('knex')({
  debug : false, //process.env.DEBUG,
  client : config('/dbAdapter'),
  connection : config('/dbConnection')
});
module.exports = knex;
