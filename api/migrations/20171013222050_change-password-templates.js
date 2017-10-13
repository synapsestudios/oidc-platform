
// exports.up = function(knex, Promise) {
//   if (process.env.OIDC_DB_ADAPTER === 'mysql') {
//     return knex.raw(`
//       ALTER TABLE SIP_client_grant
//         CHANGE grant_type grant_type ENUM('client_credentials', 'refresh_token', 'authorization_code', 'implicit', 'password')
//     `);
//   } else {
//     return knex.raw(`
//       ALTER TABLE "public"."SIP_client_grant"
//         DROP CONSTRAINT "SIP_client_grant_grant_type_check",
//         ADD CONSTRAINT "SIP_client_grant_grant_type_check" CHECK (
//           grant_type = ANY (ARRAY[
//             'client_credentials'::text,
//             'refresh_token'::text,
//             'authorization_code'::text,
//             'implicit'::text,
//             'password'::text
//           ]));
//     `);
//   }
// };



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
