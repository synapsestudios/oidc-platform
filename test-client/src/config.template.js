module.exports = {
  scope: 'openid profile app_metadata',
  redirectUri: 'https://sso-client.test:3000/',
  postLogoutRedirectUri: 'https://sso-client.test:3000/logout',
  clientId: '',
  clientSecret: '',
  identityServer: 'https://sso-client.test:9000/',
  testServer: 'https://localhost:8080/',
  responseType: 'code_id id_token token',
};
