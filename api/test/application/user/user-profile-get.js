const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const { getByRole, getByLabelText } = require('@testing-library/dom');
const { JSDOM } = require('jsdom');
const request = require('supertest');

const getServer = require('../../server');
const { expect } = Code;
const { it, describe, after, before, afterEach, beforeEach } = (exports.lab =
  Lab.script());
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');
const { stringify } = require('querystring');
const sinon = require('sinon');
const { implicitFlowLogin } = require('../../helpers/auth');

describe('GET /user/profile', () => {
  let server, client;

  before(async () => {
    server = await getServer();
  });

  beforeEach(async () => {
    client = await factory.create('client');
    await client.refresh({ withRelated: 'redirect_uris' });
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('returns the profile page of the authenticated user', async () => {
    const user = await factory.create('user');

    const { access_token } = await implicitFlowLogin(
      server,
      user.get('email'),
      'testpassword',
      client
    );

    const query = {
      access_token,
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
    };

    const res = await request(server.listener).get(
      `/user/profile?${stringify(query)}`
    );

    expect(res.statusCode).to.equal(200);

    const docBody = new JSDOM(res.text).window.document.body;
    expect(getByRole(docBody, 'button', { name: /submit/i })).to.exist();
    expect(getByLabelText(docBody, /^name$/i)).to.exist();
    expect(getByLabelText(docBody, /^profile$/i)).to.exist();
  });

  it('responds with a 401 if no auth is provided', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/user/profile',
    });

    expect(res.statusCode).to.equal(401);
  });

  it('redirects to an error page when given an invalid token', async () => {
    const query = {
      access_token: 'not a real token',
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
    };

    const res = await server.inject({
      method: 'GET',
      url: `/user/profile?${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(302);
    expect(res.headers.location).to.match(/error=unauthorized/);
  });
});
