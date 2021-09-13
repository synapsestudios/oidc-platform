const core = require('@actions/core');
const got = require('got');

const execute = async () => {
  // @TODO Make these input variables
  const response = await got.post('http://0.0.0.0:9001/op/reg', {
    headers: {
      Authorization: `Bearer token1`,
      'Content-Type': 'application/json',
    },
    responseType: 'json',
    json: {
      response_types: ['code id_token token'],
      grant_types: [
        'authorization_code',
        'implicit',
        'client_credentials',
      ],
      redirect_uris: ['https://0.0.0.0:3000/'],
      post_logout_redirect_uris: ['https://0.0.0.0:3000/logout'],
    },
  });

  if (!response.body.ok) throw new Error(response.body.error);

  core.setOutput('client_id', response.body.client_id);
  core.setOutput('client_secret', response.body.client_secret);
};

execute().catch((e) => core.setFailed(e.message));
