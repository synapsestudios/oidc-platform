module.exports = bookshelf => bookshelf.model('user_password_reset_token', {
  tableName: 'SIP_user_password_reset_token',
  idAttribute: 'token',
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
