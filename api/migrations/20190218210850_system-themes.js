
exports.up = knex => knex.schema.table('SIP_theme', t => {
  t.boolean('system').default(false);
});

exports.down = () => { /* noop */ };
