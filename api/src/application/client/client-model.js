/**
 * Client field names are specified by the openid connect spec:
 * http://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
 */

module.exports = bookshelf => ({
  tableName: 'SIP_client',
  idAttribute: 'client_id',

  parse(attributes) {
    attributes.require_auth_time = !!attributes.require_auth_time;
    return attributes;
  },

  default_acr_values() {
    return this.hasMany('client_default_acr_value', 'client_id');
  },

  post_logout_redirect_uris() {
    return this.hasMany('client_post_logout_redirect_uri', 'client_id');
  },

  request_uris() {
    return this.hasMany('client_request_uri', 'client_id');
  },

  response_types() {
    return this.hasMany('client_response_type', 'client_id');
  },

  redirect_uris() {
    return this.hasMany('client_redirect_uri', 'client_id');
  },

  grant_types() {
    return this.hasMany('client_grant', 'client_id');
  },

  contacts() {
    return this.hasMany('client_contact', 'client_id');
  },

  theme() {
    return this.belongsTo('theme', 'theme_id')
  }
});
