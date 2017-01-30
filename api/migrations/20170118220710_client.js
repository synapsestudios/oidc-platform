
exports.up = function(knex, Promise) {
  return knex.schema.createTable('SIP_client', function(table) {
    table.string('client_id').primary();
    table.string('client_secret').index().unique();
    table.string('client_name');
    table.string('logo_uri');
    table.string('client_uri');
    table.string('policy_uri');
    table.string('tos_uri');
    table.enum('application_type', ['native', 'web']).defaultTo('web');
  })
    .then(() => knex.schema.createTable('SIP_client_redirect_uri', table => {
      table.string('client_id').references('SIP_client.client_id');
      table.string('uri');

      table.primary(['client_id', 'uri']);
    }))
    .then(() => knex.schema.createTable('SIP_client_grant', table => {
      table.string('client_id').references('SIP_client.client_id');
      table.enum('grant_type', [
        'client_credentials',
        'refresh_token',
        'authorization_code',
        'implicit'
      ]);

      table.primary(['client_id', 'grant_type']);
    }))
    .then(() => knex.schema.createTable('SIP_client_contact', table => {
      table.string('client_id').references('SIP_client.client_id');
      table.string('email');

      table.primary(['client_id', 'email']);
    }));
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('SIP_client_redirect_uri'),
    knex.schema.dropTable('SIP_client_grant'),
    knex.schema.dropTable('SIP_client_contact'),
  ])
    .then(() => knex.schema.dropTable('SIP_client'));
};
