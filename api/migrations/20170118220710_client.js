
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
    .then(() => {
      if (process.env.OIDC_DB_ADAPTER === 'mysql') {
        return knex.raw(`
          CREATE TABLE SIP_client_redirect_uri (
            client_id varchar(255) NOT NULL,
            uri varchar(255) NOT NULL,
            PRIMARY KEY (client_id,uri),
            CONSTRAINT sip_client_redirect_uri_client_id_foreign FOREIGN KEY (client_id) REFERENCES SIP_client (client_id) ON DELETE CASCADE ON UPDATE CASCADE
          )
        `);
      } else {
        return knex.schema.createTable('SIP_client_redirect_uri', table => {
          table.string('client_id').references('SIP_client.client_id');
          table.string('uri');

          table.primary(['client_id', 'uri']);
        });
      }
    })
    .then(() => {
      if (process.env.OIDC_DB_ADAPTER === 'mysql') {
        return knex.raw(`
          CREATE TABLE SIP_client_grant (
            client_id varchar(255) NOT NULL,
            grant_type enum('client_credentials','refresh_token','authorization_code','implicit') NOT NULL,
            PRIMARY KEY (client_id,grant_type),
            CONSTRAINT sip_client_grant_client_id_foreign FOREIGN KEY (client_id) REFERENCES SIP_client (client_id) ON DELETE CASCADE ON UPDATE CASCADE
          )
        `);
      } else {
        return knex.schema.createTable('SIP_client_grant', table => {
          table.string('client_id').references('SIP_client.client_id');
          table.enum('grant_type', [
            'client_credentials',
            'refresh_token',
            'authorization_code',
            'implicit'
          ]);

          table.primary(['client_id', 'grant_type']);
        });
      }
    })
    .then(() => {

      if (process.env.OIDC_DB_ADAPTER === 'mysql') {
        return knex.raw(`
          CREATE TABLE SIP_client_contact (
            client_id varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            PRIMARY KEY (client_id,email),
            CONSTRAINT sip_client_contact_client_id_foreign FOREIGN KEY (client_id) REFERENCES SIP_client (client_id) ON DELETE CASCADE ON UPDATE CASCADE
          )
        `);
      } else {
        return knex.schema.createTable('SIP_client_contact', table => {

          table.string('client_id').references('SIP_client.client_id');
          table.string('email');

          table.primary(['client_id', 'email']);
        });
      }
    });
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('SIP_client_redirect_uri'),
    knex.schema.dropTable('SIP_client_grant'),
    knex.schema.dropTable('SIP_client_contact'),
  ])
    .then(() => knex.schema.dropTable('SIP_client'));
};
