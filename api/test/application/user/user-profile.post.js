const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const request = require('supertest');

const getServer = require('../../server');
const { expect } = Code;
const { it, describe, after, before, beforeEach, afterEach } = (exports.lab =
  Lab.script());
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');
const { stringify } = require('querystring');
const sinon = require('sinon');
const { implicitFlowLogin } = require('../../helpers/auth');
const { mockS3Upload } = require('../../helpers/s3');

describe('POST /user/profile', () => {
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

  it('accepts a valid payload', async () => {
    mockS3Upload();

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

    const res = await request(server.listener)
      .post(`/user/profile?${stringify(query)}`)
      .attach('picture', 'test/application/user/1x1-transparent.png');

    expect(res.statusCode).to.equal(302);
  });

  it('responds with a 401 if no auth is provided', async () => {
    const res = await server.inject({
      method: 'POST',
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
      method: 'POST',
      url: `/user/profile?${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(302);
    expect(res.headers.location).to.match(/error=unauthorized/);
  });
});
