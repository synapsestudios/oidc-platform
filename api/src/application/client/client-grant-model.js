module.exports = (bookshelf) => ({
  tableName: 'SIP_client_grant',
  idAttribute: false,

  serialize(options) {
    options = options || {};
    var serialized = bookshelf.Model.prototype.serialize.call(this, options);
    return options.strictOidc ? serialized.grant_type : serialized;
  },

});
