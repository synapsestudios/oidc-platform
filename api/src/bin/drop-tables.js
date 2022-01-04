#! /usr/bin/env node
const logger = require('../lib/logger');

var knex = require('../lib/knex');

if (process.env.NODE_ENV === 'production') {
  logger.warn('In production. Not going to drop tables.');
} else {
  const dropQuery = knex.client.config.client === 'mysql'
    ? 'DROP SCHEMA public'
    : 'DROP SCHEMA public CASCADE';

  const createQuery = 'CREATE SCHEMA public';

  knex.schema
    .raw(dropQuery)
    .raw(createQuery)
    .then(() => {
      logger.info('Dropped tables');
      process.exit(0);
    })
    .catch(e => {
      logger.error(e);
      process.exit(1);
    });
}
