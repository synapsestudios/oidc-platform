
exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_client', table => {
    table.string('introspection_endpoint_auth_method');
    table.string('introspection_endpoint_auth_signing_alg');
    table.string('revocation_endpoint_auth_method');
    table.string('revocation_endpoint_auth_signing_alg');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_client', table => {
    table.dropColumn('introspection_endpoint_auth_method');
    table.dropColumn('introspection_endpoint_auth_signing_alg');
    table.dropColumn('revocation_endpoint_auth_method');
    table.dropColumn('revocation_endpoint_auth_signing_alg');
  });
};
