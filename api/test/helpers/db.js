const knex = require('../../src/lib/knex');

module.exports = {
  truncateAll() {
    return knex.raw(`
      DO $$
      DECLARE tablenames text;
      BEGIN
          tablenames := string_agg('"' || tablename || '"', ', ')
              FROM pg_tables WHERE schemaname = 'public' AND tablename != 'oidc_migrations';
          EXECUTE 'TRUNCATE TABLE ' || tablenames;
      END; $$`
    );
  },
}
