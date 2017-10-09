module.exports = [
  bookshelf => ({name: 'client', model: require('./client/client-model')(bookshelf)}),
  bookshelf => ({name: 'client_redirect_uri', model: require('./client/client-redirect-uri-model')(bookshelf)}),
  bookshelf => ({name: 'client_request_uri', model: require('./client/client-request-uri-model')(bookshelf)}),
  bookshelf => ({name: 'client_response_type', model: require('./client/client-response-type-model')(bookshelf)}),
  bookshelf => ({name: 'client_post_logout_redirect_uri', model: require('./client/client-post-logout-redirect-uri-model')(bookshelf)}),
  bookshelf => ({name: 'client_grant', model: require('./client/client-grant-model')(bookshelf)}),
  bookshelf => ({name: 'client_default_acr_value', model: require('./client/client-default-acr-value-model')(bookshelf)}),
  bookshelf => ({name: 'client_contact', model: require('./client/client-contact-model')(bookshelf)}),
  bookshelf => ({name: 'template', model: require('./template/template-model')(bookshelf)}),
  bookshelf => ({name: 'theme', model: require('./theme/theme-model')(bookshelf)}),
  bookshelf => ({name: 'user', model: require('./user/user-model')(bookshelf)}),
  bookshelf => ({name: 'user_password_reset_token', model: require('./user/user-password-reset-token-model')(bookshelf)}),
]
