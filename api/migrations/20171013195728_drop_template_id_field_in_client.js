
exports.up = knex => knex.schema.table('SIP_client', t => {
  t.dropForeign('reset_password_template_id');
  t.dropColumn('reset_password_template_id');
});

exports.down = () => {/* noop */};
