const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const uuid = require('uuid/v4');

const getServer = require('../../server');
const { expect } = Code;
const { it, describe, after, before, beforeEach, afterEach } = exports.lab = Lab.script();
const { truncateAll } = require('../../helpers/db');
const factory = require('../../helpers/factory');
const knex = require('../../../src/lib/knex');
const { stringify } = require('querystring');
const sinon = require('sinon');

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

  it('responds with a 401 if no auth is provided', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/user/profile',
    });

    expect(res.statusCode).to.equal(401);
  });

  it('responds with a 403 with invalid token', async () => {
    const user = await factory.create('user');

    const query = {
        access_token: uuid(),
        client_id: client.get('client_id'),
        redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      };

    const res = await server.inject({
      method: 'POST',
      url: `/user/profile${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(403);
  });

  it('responds with a 404 with non-existent user', async () => {
    const query = {
        access_token: uuid(),
        id_token_hint: uuid(),
        client_id: client.get('client_id'),
        redirect_uri: client.related('redirect_uris').at(0).get('uri'),
      };

    const res = await server.inject({
      method: 'POST',
      url: `/user/profile${stringify(query)}`,
    });

    expect(res.statusCode).to.equal(404);
  });
});
