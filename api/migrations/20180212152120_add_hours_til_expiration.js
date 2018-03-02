exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_client', table => {
    return table.integer('hours_til_expiration').defaultTo(24);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_client', table => {
    table.dropColumn('hours_til_expiration');
  });
};
