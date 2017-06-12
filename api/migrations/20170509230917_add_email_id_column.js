
exports.up = function(knex, Promise) {
    return knex.schema.table('SIP_user', table => {
        return table.string('email_id').unique();
    }).then(() => {
      return knex.select().from('SIP_user').then(users => {
        return Promise.all(users.map(user => {
          return knex('SIP_user').where('id', user.id).update({ email_id: user.email.toLowerCase() });
        }));
      });
    }).then(() => {
      return knex.schema.alterTable('SIP_user', (table) => {
        table.string('email_lower').notNullable().alter();
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('email_lower');
  });
};
