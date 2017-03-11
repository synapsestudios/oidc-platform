
exports.up = function(knex, Promise) {
  return knex.schema.createTable('SIP_user_password_reset_token', function(table) {
    table.string('user_id').references('SIP_user.id');
    table.string('token');
    table.datetime('expires_at');
    table.primary(['user_id', 'token']);
  });

// CREATE TABLE `SIP_user_password_reset_token` (
//   `user_id` varchar(255) NOT NULL,
//   `token` varchar(255) NOT NULL,
//   `expires_at` datetime DEFAULT NULL,
//   PRIMARY KEY (`user_id`,`token`),
//   CONSTRAINT `sip_user_password_reset_token_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `SIP_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
// )
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('SIP_user_password_reset_token');
};
