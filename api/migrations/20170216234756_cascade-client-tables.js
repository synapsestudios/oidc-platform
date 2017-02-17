const clientTables = [
  'SIP_client_contact',
  'SIP_client_default_acr_value',
  'SIP_client_grant',
  'SIP_client_post_logout_redirect_uri',
  'SIP_client_redirect_uri',
  'SIP_client_request_uri',
  'SIP_client_response_type',
];

exports.up = function(knex, Promise) {
  return Promise.all(
    clientTables.map(tableName => {
      return knex.schema.table(tableName, table => {
        table.dropForeign('client_id');
        table.foreign('client_id').references('client_id').inTable('SIP_client').onDelete('CASCADE').onUpdate('CASCADE');
      });
    })
  );
};

exports.down = function(knex, Promise) {
  return Promise.all(
    clientTables.map(tableName => {
      return knex.schema.table(tableName, table => {
        table.dropForeign('client_id');
        table.foreign('client_id').references('client_id').inTable('SIP_client');
      });
    })
  );
};
