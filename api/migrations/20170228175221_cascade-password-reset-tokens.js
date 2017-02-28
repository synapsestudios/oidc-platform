
exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_user_password_reset_token', table => {
    table.dropForeign('user_id');
    table.foreign('user_id').references('id').inTable('SIP_user').onDelete('CASCADE').onUpdate('CASCADE');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user_password_reset_token', table => {
    table.dropForeign('user_id');
    table.foreign('user_id').references('id').inTable('SIP_user');
  });
};
