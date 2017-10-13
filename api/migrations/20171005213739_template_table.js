
const mysqlUp = knex => {
  return knex.raw(`
    CREATE TABLE SIP_template (
      theme_id int(11) unsigned NOT NULL,
      layout_id int(11) unsigned DEFAULT NULL,
      name enum('forgot-password-email','invite-email','forgot-password-success','forgot-password','reset-password-success','reset-password','user-profile','user-registration','login','end_session','interaction') NOT NULL DEFAULT 'login',
      code text NOT NULL,
      PRIMARY KEY (theme_id,name),
      CONSTRAINT SIP_template_ibfk_1 FOREIGN KEY (theme_id) REFERENCES SIP_theme (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
}

const up = knex => {
  return knex.schema.createTable('SIP_template', t => {
    t.integer('theme_id').unsigned().references('SIP_theme.id');
    t.integer('layout_id').unsigned().references('SIP_layout.id');
    t.enum('name', [
      'forgot-password-email',
      'invite-email',
      'forgot-password-success',
      'forgot-password',
      'reset-password-success',
      'reset-password',
      'user-profile',
      'user-registration',
      'login',
      'end_session',
      'interaction',
    ]);
    t.text('code');

    t.primary(['theme_id', 'name']);
  });
}

if (process.env.OIDC_DB_ADAPTER === 'mysql') {
  exports.up = mysqlUp;
} else {
  exports.up = up;
}

exports.down = knex => {
  return knex.schema.dropTable('SIP_template');
};
