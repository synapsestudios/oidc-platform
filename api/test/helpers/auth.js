const { parse, stringify } = require('querystring');
const request = require('supertest');
const { URL } = require('url');

const buildCookie = (setCookie) =>
  setCookie.map((cookieEntry) => cookieEntry.split(';')[0]).join('; ');

module.exports = {
  implicitFlowLogin: async (server, login, password, client) => {
    const authQuery = {
      client_id: client.get('client_id'),
      response_type: 'id_token token',
      scope: 'openid profile app_metadata',
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      nonce: 'nonce',
    };

    const authRes = await request(server.listener).get(
      `/op/auth?${stringify(authQuery)}`
    );

    const cookie = buildCookie(authRes.headers['set-cookie']);

    const loginRes = await request(server.listener)
      .post(`${authRes.headers.location}/login`)
      .type('form')
      .field('login', login)
      .field('password', password)
      .set('Cookie', cookie);

    const url = new URL(loginRes.headers.location);

    const redirectRes = await request(server.listener)
      .get(url.pathname)
      .set('Cookie', cookie);

    const [_, hashQuery] = redirectRes.headers.location.split('#');
    return parse(hashQuery);
  },
};
