exports.up = knex => {
  if (process.env.OIDC_DB_ADAPTER === 'mysql') {
    return knex.raw(`
      CREATE TABLE SIP_email_token (
        user_id varchar(255) NOT NULL,
        token varchar(255) NOT NULL,
        expires_at datetime DEFAULT NULL,
        PRIMARY KEY (token),
        CONSTRAINT sip_email_user_id_foreign FOREIGN KEY (user_id) REFERENCES SIP_user (id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  } else {
    return knex.schema.createTable('SIP_email_token', table => {
      table.uuid('user_id').references('id').inTable('SIP_user').onDelete('CASCADE').onUpdate('CASCADE');
      table.string('token');
      table.datetime('expires_at');
      table.primary(['token']);
    })
  }
};

exports.down = knex => {
  return knex.schema.dropTable('SIP_email_token');
};
