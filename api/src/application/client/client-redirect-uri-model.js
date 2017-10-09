module.exports = bookshelf => ({
  tableName: 'SIP_client_redirect_uri',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.uri : serialized;
  },
});
