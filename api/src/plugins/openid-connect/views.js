const querystring = require('querystring');

module.exports = {
  login: (cookie, client, error) => ({
    client,
    cookie,
    title: 'Log In',
    forgotPasswordPath: `/user/forgot-password?${querystring.stringify({
      client_id: cookie.params.client_id,
      response_type: cookie.params.response_type,
      scopt: cookie.params.scope,
      redirect_uri: cookie.params.redirect_uri,
      nonce: cookie.params.nonce
    })}`,
    error
  }),

  interaction: (cookie, client) => ({
    client,
    cookie,
    title: 'Authorize',
  })
};
