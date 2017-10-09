module.exports = (bookshelf) => ({
  tableName: 'SIP_client_default_acr_value',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.value : serialized;
  },
});
