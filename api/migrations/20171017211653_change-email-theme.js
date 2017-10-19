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
          'change-password-success-email',
          'email-settings',
          'email-verify-success',
          'email-verify-email',
          'change-email-verify-email',
          'change-email-alert-email'
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
            'change-password-success-email'::text,
            'email-settings'::text,
            'email-verify-success'::text,
            'email-verify-email'::text,
            'change-email-verify-email'::text,
            'change-email-alert-email'::text
          ]));
    `);
  }
};

exports.down = knex => { /* noop */ }
