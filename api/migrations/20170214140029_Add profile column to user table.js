
exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.json('profile')
      .notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('profile');
  });
};
