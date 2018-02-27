
exports.up = function(knex, Promise) {
    return knex.schema.table('SIP_user', table => {
        return table.string('email_lower').unique();
    }).then(() => {
      return knex.select().from('SIP_user').then(users => {
        return Promise.all(users.map(user => {
          return knex('SIP_user').where('id', user.id).update({ email_lower: user.email.toLowerCase() });
        }));
      });
    }).then(() => {
      if (process.env.OIDC_DB_ADAPTER === 'mysql') {
        return knex.raw(
          `ALTER TABLE SIP_user CHANGE email_lower email_lower VARCHAR(255) NOT NULL`
        );
      } else {
        return knex.raw(
          `ALTER TABLE "SIP_user" ALTER COLUMN email_lower SET NOT NULL`
        );
      }
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('SIP_user', table => {
    table.dropColumn('email_lower');
  });
};
