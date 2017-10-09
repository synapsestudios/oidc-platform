module.exports = (bookshelf) => bookshelf.model('theme', {
  tableName: 'SIP_theme',
  idAttribute: false,
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
