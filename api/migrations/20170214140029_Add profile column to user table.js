
exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.jsonb('profile')
      .notNullable()
      .defaultsTo(JSON.stringify({
        email_verified: false,
        phone_number_verified: false
      }));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('profile');
  });
};
