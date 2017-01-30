module.exports = bookshelf => bookshelf.model('user', {
  tableName: 'SIP_user',
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
