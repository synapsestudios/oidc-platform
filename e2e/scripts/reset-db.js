/* eslint @typescript-eslint/no-var-requires: 0 */
const main = async () => {
  const client = require("knex")({
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: "postgres",
      password: "synapse1",
      database: "database_vm",
    },
  });

  await client.raw(`
    DO $$
    DECLARE tablenames text;
    BEGIN
        tablenames := string_agg('"' || tablename || '"', ', ')
            FROM pg_tables
            WHERE schemaname = 'public'
              AND tablename NOT IN (
                'oidc_migrations',
                'oidc_migrations_lock',
                'SIP_client',
                'SIP_client_contact',
                'SIP_client_default_acr_value',
                'SIP_client_grant',
                'SIP_client_post_logout_redirect_uri',
                'SIP_client_redirect_uri',
                'SIP_client_request_uri',
                'SIP_layout',
                'SIP_template',
                'SIP_theme',
                'SIP_webhook',
                'SIP_webhook_event',
                'SIP_client_response_type'
              );

        EXECUTE 'TRUNCATE TABLE ' || tablenames || ' CASCADE';
    END; $$
  `);

  process.exit(0);
};

main();
