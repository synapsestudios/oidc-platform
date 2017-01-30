
exports.up = function(knex, Promise) {
  return knex.schema.createTable('SIP_user', function(table) {
    table.string('id', 36).primary(); // database agnostic, use string type instead of postgres UUID
    table.string('email').unique();
    table.string('password');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('SIP_user');
};
