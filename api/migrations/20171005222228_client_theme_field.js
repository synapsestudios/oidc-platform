
exports.up = knex => {
  return knex.schema.alterTable('SIP_client', t => {
    t.integer('theme_id').unsigned().references('SIP_theme.id');
  })
}

exports.down = knex => {
  return knex.schema.alterTable('SIP_client', t => {
    t.dropForeign('theme_id');
    t.dropColumn('theme_id');
  });
};

