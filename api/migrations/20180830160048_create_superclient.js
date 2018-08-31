exports.up = knex => {
  return knex.schema.alterTable('SIP_client', table => {
    table.boolean('superclient').default(0);
  });
};

exports.down = knex => {
  return knex.schema.alterTable('SIP_client', table => {
    table.dropColumn('superclient');
  });
};
