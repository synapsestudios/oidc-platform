/**
 * Client field names are specified by the openid connect spec:
 * http://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
 */
module.exports = (bookshelf) => bookshelf.model('client', {
  tableName: 'SIP_client',
  idAttribute: 'client_id',

  redirect_uris() {
    return this.hasMany('client_redirect_uri', 'client_id');
  },

  grant_types() {
    return this.hasMany('client_grant', 'client_id');
  },

  contacts() {
    return this.hasMany('client_contact', 'client_id');
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
