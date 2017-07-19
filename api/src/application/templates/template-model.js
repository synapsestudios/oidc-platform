module.exports = (bookshelf) => bookshelf.model('template', {
  tableName: 'SIP_templates',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.uri : serialized;
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
