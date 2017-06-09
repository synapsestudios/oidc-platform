
exports.up = function(knex, Promise) {
    return knex.schema.table('SIP_user', table => {
        return table.string('email_id').notNull();
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('email_id');
  });
};
