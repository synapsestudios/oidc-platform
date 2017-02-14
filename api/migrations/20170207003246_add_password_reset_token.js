
exports.up = function(knex, Promise) {
  return knex.schema.createTable('SIP_user_password_reset_token', function(table) {
    table.string('user_id').references('SIP_user.id');
    table.string('token');
    table.datetime('expires_at');
    table.primary(['user_id', 'token']);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('SIP_user_password_reset_token');
};
