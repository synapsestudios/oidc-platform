module.exports = (bookshelf) => bookshelf.model('template', {
  tableName: 'SIP_template',
  idAttribute: false,
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
