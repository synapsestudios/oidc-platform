const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { getByRole, getByText } = require('@testing-library/dom');
const { JSDOM } = require('jsdom');
const { stringify } = require('querystring');
const sinon = require('sinon');
const uuid = require('uuid');

const getServer = require('../../server');
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab =
  Lab.script());

describe('POST /user/reset-password', () => {
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

  it('returns 403 forbidden if token is not supplied', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/user/reset-password',
    });

    expect(res.statusCode).to.equal(403);
  });

  it('returns 400 when the payload is missing', async () => {
    const user = await factory.create('user');
    const token = await factory.create('emailToken', { user_id: user.id });

    const query = {
      token: token.get('token'),
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
    };

    const res = await server.inject({
      method: 'POST',
      url: `/user/reset-password?${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(400);
  });

  it('returns 400 when passwords differ', async () => {
    const user = await factory.create('user');
    const token = await factory.create('emailToken', { user_id: user.id });

    const query = {
      token: token.get('token'),
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
    };

    const res = await server.inject({
      method: 'POST',
      url: `/user/reset-password?${stringify(query)}`,
      payload: {
        password: 'abcdefgh',
        pass2: 'ijklmnop',
      },
    });

    expect(res.statusCode).to.equal(400);

    const { window } = new JSDOM(res.result);
    getByText(window.document.body, /passwords must match/i);
  });

  it('includes code_challenge in the login link URL', async () => {
    const user = await factory.create('user');
    const token = await factory.create('emailToken', { user_id: user.id });

    const query = {
      token: token.get('token'),
      client_id: client.get('client_id'),
      redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      code_challenge: uuid.v4(),
    };
    const res = await server.inject({
      method: 'POST',
      url: `/user/reset-password?${stringify(query)}`,
      payload: {
        password: 'newpassword',
        pass2: 'newpassword',
      },
    });

    expect(res.statusCode).to.equal(200);

    const { window } = new JSDOM(res.result);
    const link = getByRole(window.document.body, 'link', { name: /login/i });
    expect(link.href).to.include(query.code_challenge);
  });
});
