
exports.up = function(knex, Promise) {
  return knex.schema.dropTable('SIP_user_password_reset_token');
};

exports.down = function(knex, Promise) {
  // No going back
};
