exports.up = knex => {
  return knex.schema.alterTable('SIP_client', table => {
    table.boolean('superadmin').default(0);
  });
};

exports.down = knex => {
  return knex.schema.alterTable('SIP_client', table => {
    table.dropColumn('superadmin');
  });
};
