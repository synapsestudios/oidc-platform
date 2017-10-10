
exports.up = knex => {
  return knex.schema.createTable('SIP_theme', t => {
    t.increments('id');
    t.string('name');
  });
};

exports.down = knex => {
  return knex.schema.dropTable('SIP_theme');
};
