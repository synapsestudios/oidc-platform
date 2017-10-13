
exports.up = knex => {
  return knex.schema.table('SIP_client', t => {
    t.dropColumn('reset_password_template_id');
  });
};

exports.down = () => {/* noop */};
