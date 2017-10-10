module.exports = (bookshelf) => ({
  tableName: 'SIP_client_response_type',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.value : serialized;
  },
});
