
exports.up = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.string('email_id').notNullable();
  }).then(knex.select().from('SIP_user').then(users => {
    users.forEach(user => {
      const emailID = user.email.toLowerCase();
      knex('SIP_user').update('email_id', emailID).where('id', user.id);
    });
  }));
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('email_id');
  });
};
