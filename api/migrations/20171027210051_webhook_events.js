
exports.up = knex => knex.schema.createTable('SIP_webhook_event', t => {
  t.primary(['webhook_id', 'event']);
  t.uuid('webhook_id').references('SIP_webhook.id');
  t.string('event').index();
});

exports.down = knex => knex.schema.dropTable('SIP_webhook_event');
