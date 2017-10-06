
exports.up = knex => {
  return knex.schema.createTable('SIP_layout', t => {
    t.increments('id');
    t.string('name');
    t.text('code');
  });
};

exports.down = knex => {
  return knex.schema.dropTable('SIP_layout');
};
