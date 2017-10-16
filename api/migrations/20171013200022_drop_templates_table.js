
exports.up = knex => knex.schema.dropTable('SIP_templates');

exports.down = () => { /* noop */ };
