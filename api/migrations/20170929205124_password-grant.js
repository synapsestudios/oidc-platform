
exports.up = function(knex, Promise) {
  if (process.env.OIDC_DB_ADAPTER === 'mysql') {
    return knex.raw(`
      ALTER TABLE SIP_client_grant
        CHANGE grant_type grant_type ENUM('client_credentials', 'refresh_token', 'authorization_code', 'implicit', 'password')
    `);
  } else {
    return knex.raw(`
      ALTER TABLE "public"."SIP_client_grant"
        DROP CONSTRAINT "SIP_client_grant_grant_type_check",
        ADD CONSTRAINT "SIP_client_grant_grant_type_check" CHECK (
          grant_type = ANY (ARRAY[
            'client_credentials'::text,
            'refresh_token'::text,
            'authorization_code'::text,
            'implicit'::text,
            'password'::text
          ]));
    `);
  }
};

exports.down = function(knex, Promise) {
  if (process.env.OIDC_DB_ADAPTER === 'mysql') {
    return knex.raw(`
      ALTER TABLE SIP_client_grant
        CHANGE grant_type grant_type ENUM('client_credentials', 'refresh_token', 'authorization_code', 'implicit')
    `);
  } else {
    return knex.raw(`
      ALTER TABLE "public"."SIP_client_grant"
        DROP CONSTRAINT "SIP_client_grant_grant_type_check",
        ADD CONSTRAINT "SIP_client_grant_grant_type_check" CHECK (
          grant_type = ANY (ARRAY[
            'client_credentials'::text,
            'refresh_token'::text,
            'authorization_code'::text,
            'implicit'::text
          ]));
    `);
  }
};
