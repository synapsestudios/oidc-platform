module.exports = (bookshelf) => bookshelf.model('client_contact', {
  tableName: 'SIP_client_contact',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.email : serialized;
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
