const querystring = require('querystring');

module.exports = {
  login: (cookie, client, options, error, login) => {
    const queryStringParams = {
      client_id: cookie.params.client_id,
      response_type: cookie.params.response_type,
      scope: cookie.params.scope,
      redirect_uri: cookie.params.redirect_uri,
      nonce: cookie.params.nonce,
    };
    if (cookie.params.code_challenge) {
      queryStringParams.code_challenge = cookie.params.code_challenge;
    }
    const queryString = querystring.stringify(queryStringParams);

    return {
      client,
      cookie,
      returnTo: cookie.returnTo,
      title: 'Log In',
      forgotPasswordPath: `/user/forgot-password?${queryString}`,
      userRegistrationPath: `/user/register?${queryString}&login=true`,
      error,
      login,
    };
  },

  interaction: (cookie, client) => ({
    client,
    cookie,
    returnTo: cookie.returnTo,
    title: 'Authorize',
  })
};
