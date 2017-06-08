
exports.up = function(knex, Promise) {

    return knex.schema.table('SIP_user', table => {
        return table.string('email_id').notNull().defaultTo('');
      }).then(() => {
        return knex.select().table('SIP_user').then(userEmails => {
          return Promise.all(
            userEmails.map((user) => {
              return knex('SIP_user').update({ email_id: user.email.toLowerCase() }).where('id', user.id);
            }));
        });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('email_id');
  });
};
