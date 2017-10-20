
exports.up = knex => knex.schema.table('SIP_user', t => {
  t.string('pending_email');
  t.string('pending_email_lower');
})

exports.down = knex => knex.schema.table('SIP_user', t => {
  t.dropColumn('pending_email');
  t.dropColumn('pending_email_lower');
});
