exports.up = function(knex, Promise) {
  if (process.env.OIDC_DB_ADAPTER === 'mysql') {
    return knex.raw(`
      ALTER TABLE SIP_template
        CHANGE name name ENUM(
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
          'change-password',
          'change-password-success-email'
        )
    `);
  } else {
    return knex.raw(`
      ALTER TABLE "public"."SIP_template"
        DROP CONSTRAINT "SIP_template_name_check",
        ADD CONSTRAINT "SIP_template_name_check" CHECK (
          name = ANY (ARRAY[
            'forgot-password-email'::text,
            'invite-email'::text,
            'forgot-password-success'::text,
            'forgot-password'::text,
            'reset-password-success'::text,
            'reset-password'::text,
            'user-profile'::text,
            'user-registration'::text,
            'login'::text,
            'end_session'::text,
            'interaction'::text,
            'change-password'::text,
            'change-password-success-email'::text
          ]));
    `);
  }
};

exports.down = knex => { /* noop */ }
