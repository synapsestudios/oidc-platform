module.exports = (bookshelf) => bookshelf.model('client_request_uri', {
  tableName: 'SIP_client_request_uri',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.uri : serialized;
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
