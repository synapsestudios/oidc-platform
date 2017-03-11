
exports.up = function(knex, Promise) {
  return knex.schema.createTable('SIP_user', function(table) {
    table.uuid('id').primary();
    table.string('email').unique();
    table.string('password');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('SIP_user');
};
