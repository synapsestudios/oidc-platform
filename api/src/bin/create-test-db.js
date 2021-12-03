#! /usr/bin/env node
const knex = require('../lib/knex');

knex
  .raw(`CREATE DATABASE ${process.env.OIDC_DB_NAME}_test`)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    if (error.message.indexOf('already exists') > -1) {
      process.exit(0);
    }
    console.log(error);
    process.exit(1);
  });
