module.exports = (bookshelf) => bookshelf.model('client_email_template', {
  tableName: 'SIP_client_email_templates',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.uri : serialized;
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
