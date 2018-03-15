#! /usr/bin/env node
const logger = require('../lib/logger');
var ioc = require('./cli-app');

var knex = require('../lib/knex');

if (process.env.NODE_ENV === 'production') {
  logger.warn('In production. Not going to drop tables.');
} else {
  knex.schema
    .raw('DROP SCHEMA public CASCADE')
    .raw('CREATE SCHEMA public')
    .then(() => {
      logger.info('Dropped tables');
      process.exit(0);
    });
}
