exports.up = knex => knex.schema.createTable('SIP_webhook', t => {
  t.uuid('id').primary();
  t.string('client_id');
  t.string('url', 1024);
});

exports.down = knex => knex.schema.dropTable('SIP_webhook');
