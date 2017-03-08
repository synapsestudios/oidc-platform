
exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.json('app_metadata');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('app_metadata');
  });
};
