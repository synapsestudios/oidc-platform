exports.up = knex => knex.schema.table('SIP_template', t => {
  t.json('options');
});

exports.down = () => {/*noop*/};
