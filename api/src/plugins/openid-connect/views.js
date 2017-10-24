const querystring = require('querystring');

module.exports = {
  login: (cookie, client, error) => ({
    client,
    cookie,
    returnTo: cookie.returnTo,
    title: 'Log In',
    forgotPasswordPath: `/user/forgot-password?${querystring.stringify({
      client_id: cookie.params.client_id,
      response_type: cookie.params.response_type,
      scope: cookie.params.scope,
      redirect_uri: cookie.params.redirect_uri,
      nonce: cookie.params.nonce
    })}`,
    error
  }),

  interaction: (cookie, client) => ({
    client,
    cookie,
    returnTo: cookie.returnTo,
    title: 'Authorize',
  })
};
